/**
 * Avatar Proxy Module
 * Tải và lưu cache avatar từ CDN TikTok để tránh lỗi CORS khi vẽ lên HTML5 Canvas.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 giờ

// Đảm bảo thư mục cache tồn tại
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Bộ nhớ cache tạm trong RAM để phản hồi siêu nhanh
const memoryCache = new Map();

// Các domain CDN TikTok hợp lệ
const ALLOWED_HOSTS = [
  'tiktokcdn.com',
  'tiktokcdn-us.com',
  'byteoversea.com',
  'ibyteimg.com',
  'akamaized.net',
  'tiktok.com'
];

function isAllowedDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_HOSTS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch (err) {
    return false;
  }
}

function getCacheKey(urlStr) {
  return crypto.createHash('md5').update(urlStr).digest('hex');
}

/**
 * Express handler cho route /avatar?u=<url>
 */
async function handleAvatarProxy(req, res) {
  const targetUrl = req.query.u;

  if (!targetUrl) {
    return res.status(400).send('Missing url parameter "u"');
  }

  if (!isAllowedDomain(targetUrl)) {
    return res.status(403).send('Domain not allowed');
  }

  const cacheKey = getCacheKey(targetUrl);
  const now = Date.now();

  // 1. Kiểm tra RAM cache
  const inMemory = memoryCache.get(cacheKey);
  if (inMemory && inMemory.expiresAt > now) {
    res.set({
      'Content-Type': inMemory.contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    });
    return res.send(inMemory.data);
  }

  // 2. Kiểm tra File cache
  const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);
  const dataPath = path.join(CACHE_DIR, `${cacheKey}.bin`);

  if (fs.existsSync(metaPath) && fs.existsSync(dataPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (meta.expiresAt > now) {
        const fileData = fs.readFileSync(dataPath);
        // Đưa vào RAM cache
        memoryCache.set(cacheKey, {
          data: fileData,
          contentType: meta.contentType,
          expiresAt: meta.expiresAt
        });

        res.set({
          'Content-Type': meta.contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
        });
        return res.send(fileData);
      }
    } catch (e) {
      // Bỏ qua nếu đọc file lỗi
    }
  }

  // 3. Tải từ CDN TikTok
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch avatar from TikTok CDN');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const expiresAt = now + CACHE_TTL_MS;

    // Lưu vào RAM
    memoryCache.set(cacheKey, {
      data: buffer,
      contentType,
      expiresAt
    });

    // Lưu vào File cache bất đồng bộ
    fs.writeFile(dataPath, buffer, () => {});
    fs.writeFile(metaPath, JSON.stringify({ contentType, expiresAt, url: targetUrl }), () => {});

    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    });
    return res.send(buffer);
  } catch (err) {
    return res.status(502).send('Error fetching avatar: ' + err.message);
  }
}

module.exports = {
  handleAvatarProxy,
  isAllowedDomain
};
