// utils/deviceDetect.js
function getDeviceType(userAgent) {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipod/i.test(ua)) return "Mobile";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  if (/macintosh|windows|linux|cros/i.test(ua)) return "Desktop";

  return "Unknown";
}

function getBrowser(userAgent) {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();

  if (ua.includes("chrome") && !ua.includes("edge") && !ua.includes("opr")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("opr") || ua.includes("opera")) return "Opera";
  if (ua.includes("edge")) return "Edge";
  if (ua.includes("msie") || ua.includes("trident")) return "Internet Explorer";

  return "Other";
}

module.exports = { getDeviceType, getBrowser };