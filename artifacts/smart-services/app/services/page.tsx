import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  Braces,
  Cloud,
  FileText,
  Globe2,
  GraduationCap,
  Layers3,
  Menu,
  Network,
  Palette,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const services = [
  {
    icon: Palette,
    title: "التصميم الجرافيكي",
    description: "شعارات وإعلانات ومنشورات وهويات بصرية.",
  },
  {
    icon: Globe2,
    title: "المواقع الإلكترونية",
    description: "مواقع تعريفية وصفحات هبوط وحلول ويب.",
  },
  {
    icon: Smartphone,
    title: "تطبيقات الهاتف",
    description: "تطبيقات Android وتصميم واجهات.",
  },
  {
    icon: FileText,
    title: "Word وPDF وPowerPoint",
    description: "تنسيق وتحويل وتجهيز الملفات.",
  },
  {
    icon: Layers3,
    title: "Excel وقواعد البيانات",
    description: "جداول ونماذج وقواعد بيانات وتقارير.",
  },
  {
    icon: Braces,
    title: "البرمجة والحلول التقنية",
    description: "حل الأخطاء وتطوير وتنفيذ الأفكار.",
  },
  {
    icon: Cloud,
    title: "الاستضافة والنشر",
    description: "رفع المواقع وإعداد خدمات النشر.",
  },
  {
    icon: Network,
    title: "الشبكات والأنظمة",
    description: "مساعدة في إعداد الأنظمة وحل المشاكل.",
  },
  {
    icon: GraduationCap,
    title: "الخدمات الأكاديمية التقنية",
    description: "تجهيز المشاريع والبحوث والعروض التقنية.",
  },
  {
    icon: Sparkles,
    title: "طلب مخصص",
    description: "اكتب احتياجك كما هو وسنحدد الحل.",
  },
];

function BrandMark() {
  return (
    <span className="ss-brand-mark" aria-hidden="true">
      <Workflow size={21} strokeWidth={2.1} />
    </span>
  );
}

export default function Services() {
  return (
    <div className="ss-home" dir="rtl">
      <ScrollReveal />
      <header className="ss-header">
        <div className="ss-container ss-nav">
          <Link href="/" className="ss-brand" aria-label="الحلول التقنية الذكية">
            <BrandMark />
            <div>
              الحلول التقنية الذكية
              <span>خبرة رقمية أقرب إليك</span>
            </div>
          </Link>
          <nav className="ss-navlinks" aria-label="التنقل الرئيسي">
            <Link href="/">الرئيسية</Link>
            <Link href="/services" aria-current="page">
              الخدمات
            </Link>
            <Link href="/request">كيف تطلب؟</Link>
          </nav>
          <Link
            href="/request"
            className="ss-button ss-button-primary ss-nav-cta"
          >
            اطلب الخدمة الآن <ArrowUpLeft size={17} />
          </Link>
          <details className="ss-mobile-menu ss-mobile-nav">
            <summary aria-label="فتح القائمة">
              <Menu size={19} />
            </summary>
            <nav aria-label="التنقل">
              <Link href="/">الرئيسية</Link>
              <Link href="/services" aria-current="page">
                الخدمات
              </Link>
              <Link href="/request">طلب خدمة</Link>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section className="ss-hero ss-services-hero">
          <div className="ss-container">
            <span className="ss-section-label">خدماتنا</span>
            <h1 className="ss-services-title">
              حلول رقمية تبدأ من احتياجك
            </h1>
            <p className="ss-hero-lede">
              اختر المجال الأقرب لفكرتك، أو اكتب طلبك بطريقتك. نساعدك على
              تحديد المطلوب ونتابع معك حتى التسليم.
            </p>
            <Link href="/request" className="ss-button ss-button-primary">
              اطلب الخدمة الآن <ArrowLeft size={18} />
            </Link>
          </div>
        </section>

        <section className="ss-section" id="services">
          <div className="ss-container">
            <div className="ss-section-head">
              <div>
                <span className="ss-section-label">اختر ما يناسبك</span>
                <h2>من فكرة إلى حل جاهز</h2>
              </div>
              <p>
                لا تجد الخدمة التي تبحث عنها؟ أرسل احتياجك كما هو، وسنراجع
                التفاصيل معك.
              </p>
            </div>
            <div className="ss-services-grid">
              {services.map(({ icon: Icon, title, description }) => (
                <article className="ss-service-card" key={title}>
                  <div className="ss-service-icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Link href="/request" className="ss-card-link">
                    اطلب هذه الخدمة <ArrowLeft size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ss-container">
          <div className="ss-final-cta">
            <span className="ss-section-label">خطوتك الأولى تبدأ هنا</span>
            <h2>ما الذي تريد إنجازه اليوم؟</h2>
            <p>اكتب لنا ما تحتاجه، وسنبدأ من التفاصيل التي تهمك.</p>
            <Link href="/request" className="ss-button ss-button-primary">
              اطلب الخدمة الآن <ArrowLeft size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="ss-footer">
        <div className="ss-container ss-footer-inner">
          <div>
            <span className="ss-footer-brand">الحلول التقنية الذكية</span>
            <span> — خدمات رقمية عن بُعد، أقرب مما تتوقع.</span>
          </div>
          <div className="ss-footer-note">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <ArrowUpLeft size={14} />
          </div>
        </div>
      </footer>
    </div>
  );
}
