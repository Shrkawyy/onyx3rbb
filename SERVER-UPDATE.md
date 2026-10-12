# Onyx server connection update — 2026-09-08

This is an intermediate connection update, **not a completed Ryuten engine port**.
The active renderer is still Onyx's existing deo/PIXI engine. Albion.wasm and the
official Ryuten renderer have not been integrated. Live gameplay is unverified.

## Verified public server catalogue

Source: https://api.senpa.io/tracker, retrieved 2026-09-08. The official
https://senpa.io/web/ lobby displayed all three names and modes.

| Name | Mode | Host | Reported version |
| --- | --- | --- | --- |
| Nemesis | Free For All | eu1.senpa.io:7101 | 4.0.0 |
| Zephyr | Dual | eu1.senpa.io:7106 | 4.0.0 |
| WindBine | MegaSplitX | eu1.senpa.io:7112 | 4.0.0 |

The existing EU Dual (1200) and Mega (9999) addresses did not match the current
tracker. The active page now offers the three requested named servers. The new
catalogue refreshes their hosts and populations from the public tracker, retains
the selected named server, validates hosts, and keeps last known addresses if the
tracker fails. It does not reconnect a running session during refresh.

The adapter now routes all three target hosts through the existing modern Senpa
connection/authentication path. This is a candidate integration based on their
reported shared version; gameplay packet compatibility is not proven by the
tracker. Existing unrelated legacy hosts retain the original path. Both direct
HTML loading and the Tampermonkey loader include the catalogue before the adapter.
The userscript version is 2.0.4 to invalidate its versioned asset requests.

No authentication challenge, network restriction, or access control was bypassed.
No fake session token or fabricated gameplay state was introduced.

## Validation and remaining work

- `node --test tests/servers.test.cjs`: six passing offline integration tests.
- JavaScript syntax checks and `git diff --check`: passed.
- The official lobby rejected this cloud browser with:
  `VPN/proxy connections are blocked. Disable it and press Play to retry.`
- Therefore no successful spawn, movement, split, or world decode is claimed.
- The Ryuten renderer bridge, ported controls, and feature parity remain to be implemented.
- Unused alternate engines and WASM files were retained; deleting them before
  selecting and validating the final runtime would risk breaking other entry points.

## تجربة التعديل

هذه حزمة تعديلات على مشروع Onyx الموجود، وليست لعبة مستقلة أو نقلًا مكتملًا لريوتن.

1. احتفظ بنسخة من مشروعك قبل التعديل.
2. ارفع الملفات الموجودة بالحزمة إلى نفس مساراتها داخل مستودع Onyx؛ استبدل الملفات المتطابقة وأضف الملفات الجديدة.
3. بعد نشر تحديث موقعك، ثبّت نسخة `kateronyx.user.js` الجديدة بدل القديمة.
4. افتح سينبا واختر Nemesis أو Zephyr أو WindBine من القائمة.
5. جرّب الدخول والحركة والانقسام لكل سيرفر. ظهور الاسم وحده لا يثبت نجاح التشغيل.

السكربت يحتفظ بعنوان الاستضافة الموجود في مشروعك: `https://onyx-og.vercel.app/`.
لو ملفاتك منشورة على عنوان مختلف، غيّر `DEFAULT_BASE_URL` وعنواني التحديث والتنزيل
في `kateronyx.user.js` إلى موقعك الصحيح. لم يتم نشر هذه التعديلات إلى GitHub أو Vercel.
