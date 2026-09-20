import Link from "next/link";

const services = [
  ["🎨","التصميم الجرافيكي","تصاميم إعلانية وشعارات ومنشورات وهوية بصرية."],
  ["🌐","المواقع الإلكترونية","تصميم وتطوير مواقع احترافية ومتجاوبة."],
  ["📱","تطبيقات الهاتف","تصميم وتنفيذ تطبيقات Android وحلول رقمية."],
  ["📄","الملفات والمستندات","Word وPDF وPowerPoint والتنسيق والتحويل."],
  ["📊","Excel وقواعد البيانات","جداول ونماذج وقواعد بيانات وتنظيم المعلومات."],
  ["💻","الحلول التقنية","برمجة وحلول للمشاكل والطلبات التقنية المختلفة."]
];

export default function Home(){
 return <>
  <header className="header"><div className="container nav">
   <Link href="/" className="logo">الحلول <span>التقنية الذكية</span></Link>
   <nav className="navlinks">
    <Link href="/">الرئيسية</Link><Link href="/services">الخدمات</Link><Link href="/request">طلب خدمة</Link><Link href="/auth/login">تسجيل الدخول</Link>
   </nav>
   <Link href="/request" className="btn btn-primary mobile-menu">طلب خدمة</Link>
  </div></header>

  <main>
   <section className="hero"><div className="container hero-grid">
    <div>
     <span className="badge">خدمات تقنية ورقمية عن بُعد</span>
     <h1>اكتب ما تحتاجه،<br/><span>وننفذه لك.</span></h1>
     <p>منصة متخصصة لاستقبال وتنفيذ الخدمات التقنية والرقمية. أرسل طلبك وملفاتك، وسنتولى تنفيذ الخدمة وتسليمها لك عبر WhatsApp.</p>
     <div className="actions"><Link href="/request" className="btn btn-primary">ابدأ طلبك الآن</Link><Link href="/services" className="btn btn-light">استعرض الخدمات</Link></div>
    </div>
    <div className="hero-card">
     <h3>نموذج طلب سريع</h3>
     <div className="request-preview">
      <div className="preview-row"><div className="iconbox">💡</div><div><b>اكتب طلبك بحرية</b><p>لا تحتاج لمعرفة اسم الخدمة المناسبة.</p></div></div>
      <div className="preview-row"><div className="iconbox">📎</div><div><b>أرفق ملفاتك</b><p>صور، PDF، Word، PowerPoint وغيرها.</p></div></div>
      <div className="preview-row"><div className="iconbox">💬</div><div><b>تسليم عبر WhatsApp</b><p>نجهز لك رسالة التسليم بعد التنفيذ.</p></div></div>
     </div>
    </div>
   </div></section>

   <section className="section"><div className="container">
    <div className="section-head"><h2>خدماتنا</h2><p>حلول تقنية تلبي احتياجك، حتى إذا لم تعرف اسم الخدمة التي تحتاجها.</p></div>
    <div className="grid">{services.map(([icon,title,desc])=><div className="card" key={title}><div className="service-icon">{icon}</div><h3>{title}</h3><p>{desc}</p><Link href="/request" className="card-link">اطلب الخدمة ←</Link></div>)}</div>
   </div></section>

   <section className="section"><div className="container">
    <div className="section-head"><h2>كيف تعمل المنصة؟</h2><p>من الطلب إلى التسليم بخطوات بسيطة.</p></div>
    <div className="steps">
     {[["01","أرسل طلبك","اكتب ما تحتاجه وأرفق الملفات المطلوبة."],["02","نراجع الطلب","نراجع التفاصيل ونتواصل معك عند الحاجة."],["03","نُنفّذ الخدمة","يتم تنفيذ طلبك وفق التفاصيل المتفق عليها."],["04","نُسلّم النتيجة","تصلك الخدمة أو الملف النهائي عبر WhatsApp."]].map(x=><div className="step" key={x[0]}><div className="step-num">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}
    </div>
   </div></section>

   <section className="section"><div className="container"><div className="cta"><h2>لديك طلب تقني مختلف؟</h2><p>لا تحتاج إلى معرفة اسم الخدمة. اكتب لنا ما تريد وسنراجع طلبك ونحدد لك الحل المناسب.</p><Link href="/request" className="btn btn-primary">اكتب طلبك الآن</Link></div></div></section>
  </main>

  <footer className="footer"><div className="container footer-inner"><div><strong>الحلول التقنية الذكية</strong><br/>خدمات تقنية ورقمية عن بُعد</div><div>جميع الحقوق محفوظة © {new Date().getFullYear()}</div></div></footer>
 </>
}
