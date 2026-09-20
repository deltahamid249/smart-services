import Link from "next/link";

const services=[
["🎨","التصميم الجرافيكي","شعارات، إعلانات، منشورات وهوية بصرية."],
["🌐","المواقع الإلكترونية","مواقع احترافية وصفحات متجاوبة."],
["📱","تطبيقات الهاتف","تصميم وتنفيذ تطبيقات Android وحلول رقمية."],
["📄","الملفات والمستندات","Word وPDF وPowerPoint والتنسيق والتحويل."],
["📊","Excel وقواعد البيانات","جداول ونماذج وقواعد بيانات وتقارير."],
["💻","الحلول التقنية","برمجة وحل المشاكل والطلبات التقنية."]
];

export default function Home(){
return <>
<header className="header"><div className="container nav">
<Link href="/" className="logo">الحلول <span>التقنية الذكية</span></Link>
<nav className="navlinks"><Link href="/">الرئيسية</Link><Link href="/services">الخدمات</Link><Link href="/request">طلب خدمة</Link><Link href="/auth/login">تسجيل الدخول</Link></nav>
<Link href="/request" className="btn btn-primary mobile-only">طلب خدمة</Link>
</div></header>

<section className="hero"><div className="container hero-grid">
<div><span className="badge">خدمات تقنية ورقمية عن بُعد</span>
<h1>اكتب ما تحتاجه،<br/><span>وننفذه لك.</span></h1>
<p className="hero-text">منصة متخصصة لاستقبال وتنفيذ الخدمات التقنية والرقمية عن بُعد. أرسل طلبك وملفاتك، وسنتولى تنفيذ الخدمة وتسليمها لك عبر WhatsApp.</p>
<div className="actions"><Link href="/request" className="btn btn-primary">ابدأ طلبك الآن</Link><Link href="/services" className="btn btn-secondary">استعرض الخدمات</Link></div>
</div>
<div className="hero-card"><h3>طلب خدمة سريع</h3><div className="preview">
<div className="preview-row"><div className="icon">💡</div><div><b>اكتب احتياجك</b><p>حتى إذا لم تعرف اسم الخدمة.</p></div></div>
<div className="preview-row"><div className="icon">📎</div><div><b>أرفق ملفاتك</b><p>صور وPDF وWord وPowerPoint وغيرها.</p></div></div>
<div className="preview-row"><div className="icon">💬</div><div><b>تسليم عبر WhatsApp</b><p>بعد إكمال الخدمة وتجهيز النتيجة.</p></div></div>
</div></div>
</div></section>

<section className="section"><div className="container"><div className="section-head"><h2>خدماتنا</h2><p>خدمات تقنية ورقمية متعددة لتلبية احتياجك.</p></div>
<div className="grid">{services.map(s=><div className="card" key={s[1]}><div className="service-icon">{s[0]}</div><h3>{s[1]}</h3><p>{s[2]}</p><Link href="/request" className="card-link">اطلب الخدمة ←</Link></div>)}</div>
</div></section>

<section className="section"><div className="container"><div className="section-head"><h2>كيف تعمل المنصة؟</h2><p>من الطلب إلى التسليم بخطوات واضحة.</p></div>
<div className="steps">{[
["01","أرسل طلبك","اكتب ما تحتاجه وأرفق الملفات المطلوبة."],
["02","نراجع الطلب","نراجع التفاصيل ونتواصل معك عند الحاجة."],
["03","نُنفّذ الخدمة","يتم تنفيذ طلبك وفق التفاصيل المتفق عليها."],
["04","نُسلّم النتيجة","تصلك الخدمة أو الملف النهائي."]
].map(x=><div className="step" key={x[0]}><div className="step-number">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div>
</div></section>

<section className="section"><div className="container"><div className="cta"><h2>لديك طلب تقني مختلف؟</h2><p>اكتب لنا ما تريد، وسنحدد لك الحل المناسب.</p><Link href="/request" className="btn btn-primary">اكتب طلبك الآن</Link></div></div></section>

<footer className="footer"><div className="container footer-inner"><div><strong>الحلول التقنية الذكية</strong><br/>خدمات تقنية ورقمية عن بُعد</div><div>جميع الحقوق محفوظة © {new Date().getFullYear()}</div></div></footer>
</>
}
