# ONYX على 3rb.io — فرع تجريبي

هذا الفرع يحافظ على واجهة ONYX ولوحة البوتات، ويضيف:

- كتالوج 3rb الرسمي من `https://3rb.io/php/Servers.php`.
- اختيار كل السيرفرات والمودات التي يرجعها 3rb.
- روابط اتصال `wss://alpha.3rb.io:<port>/V5`.
- `onyx-3rb-adapter.js` كنقطة ربط مع ONYX.

## الحالة الحالية

تم ربط اكتشاف السيرفرات وتوجيه `SC.init` إلى مسار 3rb `/V5`. أما تشغيل اللعب والبوتات فعليًا فيحتاج **codec/handshake الرسمي لـ3rb**؛ لذلك لا يتم إرسال opcodes Senpa أو حزم مخمّنة. لا يوجد تجاوز لـCaptcha أو anti-bot.

## الاختبار

```bash
node --test tests/onyx-3rb.test.cjs
```
