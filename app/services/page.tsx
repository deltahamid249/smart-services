import Link from "next/link";

const services=[
["🎨","التصميم الجرافيكي","شعارات وإعلانات ومنشورات وهويات بصرية."],
["🌐","المواقع الإلكترونية","مواقع تعريفية وصفحات هبوط وحلول ويب."],
["📱","تطبيقات الهاتف","تطبيقات Android وتصميم واجهات."],
["📄","Word وPDF وPowerPoint","تنسيق وتحويل وتجهيز الملفات."],
["📊","Excel وقواعد البيانات","جداول ونماذج وقواعد بيانات وتقارير."],
["💻","البرمجة والحلول التقنية","حل الأخطاء وتطوير وتنفيذ الأفكار."],
["🖥️","الاستضافة والنشر","رفع المواقع وإعداد خدمات النشر."],
["🌐","الشبكات والأنظمة","مساعدة في إعداد الأنظمة وحل المشاكل."],
["🎓","الخدمات الأكاديمية التقنية","تجهيز المشاريع والبحوث والعروض التقنية."],
["⚙️","طلب مخصص","اكتب احتياجك كما هو وسنحدد الحل."]
];

export default function Services(){return <>
<header className="header"><div className="container nav"><Link href="/" className="logo">الحلول <span>التقنية الذكية</span></Link><nav className="navlinks"><Link href="/">الرئيسية</Link><Link href="/services" className="active">الخدمات</Link><Link href="/request">طلب خدمة</Link></nav></div></header>
<main className="page"><div className="container"><div className="page-title"><h1>خدماتنا التقنية</h1><p>اختر خدمة أو اكتب طلبك بحرية.</p></div><div className="grid">{services.map(s=><div className="card" key={s[1]}><div className="service-icon">{s[0]}</div><h3>{s[1]}</h3><p>{s[2]}</p><Link href="/request" className="card-link">طلب الخدمة ←</Link></div>)}</div></div></main>
<footer className="footer"><div className="container footer-inner"><strong>الحلول التقنية الذكية</strong><span>© {new Date().getFullYear()}</span></div>
</footer>
</>}
