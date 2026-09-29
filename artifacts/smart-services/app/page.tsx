import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  Braces,
  Check,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  FileText,
  Globe2,
  Headphones,
  Layers3,
  Menu,
  MessageCircle,
  Palette,
  Paperclip,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WandSparkles,
  Workflow,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const services = [
  {
    icon: Palette,
    title: "التصميم الجرافيكي",
    description: "هوية بصرية ومنشورات وإعلانات توصل فكرتك بالشكل الصحيح.",
  },
  {
    icon: Globe2,
    title: "المواقع الإلكترونية",
    description: "صفحات ومواقع متجاوبة، جاهزة لتعريف الناس بمشروعك.",
  },
  {
    icon: Smartphone,
    title: "تطبيقات الهاتف",
    description: "واجهات وتجارب تطبيقات وحلول رقمية تناسب احتياجك.",
  },
  {
    icon: FileText,
    title: "الملفات والمستندات",
    description: "تنسيق وتحويل ملفات Word وPDF والعروض التقديمية.",
  },
  {
    icon: Layers3,
    title: "Excel وقواعد البيانات",
    description: "جداول ونماذج وتقارير ترتّب بياناتك وتختصر وقتك.",
  },
  {
    icon: Braces,
    title: "الحلول التقنية",
    description: "برمجة ومراجعة وحل للمشكلات والطلبات التقنية المختلفة.",
  },
];

const steps = [
  ["٠١", "أرسل ما تحتاجه", "صف طلبك ببساطة، وأرفق الملفات إن وُجدت."],
  ["٠٢", "نراجع التفاصيل", "نفهم المطلوب ونتواصل معك لتوضيح أي نقطة."],
  ["٠٣", "نبدأ التنفيذ", "نعمل على الخدمة وفق ما اتفقنا عليه معك."],
  ["٠٤", "تستلم النتيجة", "تصلك الملفات والنتيجة النهائية عبر WhatsApp."],
];

function PreviewLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function BrandMark() {
  return (
    <span className="ss-brand-mark" aria-hidden="true">
      <Workflow size={21} strokeWidth={2.1} />
    </span>
  );
}

export default function Home() {
  return (
    <div className="ss-home" dir="rtl">
      <ScrollReveal />
      <header className="ss-header">
        <div className="ss-container ss-nav">
          <PreviewLink href="/" className="ss-brand" ariaLabel="الحلول التقنية الذكية">
            <BrandMark />
            <div>
              الحلول التقنية الذكية
              <span>خبرة رقمية أقرب إليك</span>
            </div>
          </PreviewLink>
          <nav className="ss-navlinks" aria-label="التنقل الرئيسي">
            <PreviewLink href="/">الرئيسية</PreviewLink>
            <PreviewLink href="/services">الخدمات</PreviewLink>
            <PreviewLink href="/request">كيف تطلب؟</PreviewLink>
          </nav>
          <PreviewLink href="/request" className="ss-button ss-button-primary ss-nav-cta">
            اطلب الخدمة الآن <ArrowUpLeft size={17} />
          </PreviewLink>
          <details className="ss-mobile-menu ss-mobile-nav">
            <summary aria-label="فتح القائمة">
              <Menu size={19} />
            </summary>
            <nav aria-label="التنقل">
              <PreviewLink href="/">الرئيسية</PreviewLink>
              <PreviewLink href="/services">الخدمات</PreviewLink>
              <PreviewLink href="/request">طلب خدمة</PreviewLink>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section className="ss-hero">
          <div className="ss-container ss-hero-grid">
            <div className="ss-hero-copy">
              <div className="ss-eyebrow">
                <span className="ss-eyebrow-dot" />
                خدمات تقنية ورقمية عن بُعد
              </div>
              <h1>
                اكتب ما تحتاجه،
                <br />
                ونحوّله إلى <em>إنجاز.</em>
              </h1>
              <p className="ss-hero-lede">
                من فكرة صغيرة إلى ملف جاهز أو حل تقني متكامل؛ أرسل طلبك من مكانك،
                ودعنا نهتم بالتنفيذ والتسليم خطوة بخطوة.
              </p>
              <div className="ss-hero-actions">
                <PreviewLink href="/request" className="ss-button ss-button-primary">
                  اطلب الخدمة الآن <ArrowLeft size={18} />
                </PreviewLink>
                <PreviewLink href="/services" className="ss-button ss-button-secondary">
                  استكشف الخدمات <ChevronLeft size={17} />
                </PreviewLink>
              </div>
              <div className="ss-trust-note">
                <span className="ss-trust-rule" />
                طلب واضح، تواصل مباشر، وتسليم رقمي من دون تعقيد
              </div>
            </div>

            <div className="ss-hero-art" aria-label="معاينة خطوات طلب الخدمة">
              <div className="ss-art-disc" />
              <div className="ss-float-tag ss-float-tag-one">
                <Sparkles size={17} />
                حتى لو لم تعرف اسم الخدمة
              </div>
              <div className="ss-order-card">
                <div className="ss-order-top">
                  <div>
                    <div className="ss-order-kicker">بداية بسيطة</div>
                    <div className="ss-order-title">طلبك، على طريقتك</div>
                  </div>
                  <span className="ss-order-status">
                    <i /> جاهز للبدء
                  </span>
                </div>
                <div className="ss-order-detail">
                  <span className="ss-order-icon"><ClipboardList size={19} /></span>
                  <div>
                    <b>اشرح ما تحتاجه</b>
                    <span>كلماتك تكفي لنبدأ</span>
                  </div>
                </div>
                <div className="ss-order-detail">
                  <span className="ss-order-icon coral"><Paperclip size={18} /></span>
                  <div>
                    <b>أرفق التفاصيل</b>
                    <span>صور أو ملفات عند الحاجة</span>
                  </div>
                </div>
                <div className="ss-order-detail">
                  <span className="ss-order-icon"><MessageCircle size={18} /></span>
                  <div>
                    <b>نتابع معك مباشرة</b>
                    <span>التواصل والتسليم عبر WhatsApp</span>
                  </div>
                </div>
                <div className="ss-order-progress">
                  <span><Check size={13} /></span>
                  من الطلب إلى النتيجة، كل شيء واضح
                </div>
              </div>
              <div className="ss-float-tag ss-float-tag-two">
                <FileCheck2 size={17} />
                ملفك النهائي يصلك جاهزاً
              </div>
              <Sparkles className="ss-spark" size={25} />
            </div>
          </div>
        </section>

        <section className="ss-proof" aria-label="مزايا الخدمة">
          <div className="ss-container ss-proof-row">
            <div className="ss-proof-item">
              <span className="ss-proof-icon"><Send size={17} /></span>
              ابدأ من أي مكان
            </div>
            <div className="ss-proof-item">
              <span className="ss-proof-icon"><Headphones size={17} /></span>
              تواصل مباشر وواضح
            </div>
            <div className="ss-proof-item">
              <span className="ss-proof-icon"><ShieldCheck size={17} /></span>
              تسليم رقمي منظم
            </div>
          </div>
        </section>

        <section className="ss-section" id="services">
          <div className="ss-container">
            <div className="ss-section-head">
              <div>
                <span className="ss-section-label">خدماتنا</span>
                <h2>مساحة واسعة لحلولك</h2>
              </div>
              <p>
                خدمة واحدة أو أكثر؛ اختر المجال الأقرب لاحتياجك، وإن لم تجده
                اكتب لنا فكرتك كما هي.
              </p>
            </div>
            <div className="ss-services-grid">
              {services.map(({ icon: Icon, title, description }) => (
                <article className="ss-service-card" key={title}>
                  <div className="ss-service-icon"><Icon size={22} strokeWidth={1.8} /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <PreviewLink href="/request" className="ss-card-link">
                    اطلب هذه الخدمة <ArrowLeft size={15} />
                  </PreviewLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ss-section ss-process-section" id="how-it-works">
          <div className="ss-container">
            <div className="ss-section-head">
              <div>
                <span className="ss-section-label">خطوات واضحة</span>
                <h2>من أول رسالة إلى التسليم</h2>
              </div>
              <p>لا تحتاج إلى معرفة تقنية مسبقة. فقط أخبرنا بما تريد الوصول إليه.</p>
            </div>
            <div className="ss-process">
              {steps.map(([number, title, detail]) => (
                <article className="ss-process-step" key={number}>
                  <div className="ss-step-no">{number}</div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ss-section">
          <div className="ss-container ss-promise-grid">
            <div className="ss-promise-copy">
              <span className="ss-section-label">تجربة أهدأ وأوضح</span>
              <h2>خلّ التفاصيل علينا، وركّز على فكرتك.</h2>
              <p>
                نؤمن أن الخدمة التقنية الجيدة تبدأ بفهم احتياجك، لا بإغراقك
                بالمصطلحات. نرتب الخطوات معك ونعيد النتيجة بصيغة سهلة الاستخدام.
              </p>
            </div>
            <div className="ss-promise-list">
              <article className="ss-promise-item">
                <CircleHelp size={19} />
                <h3>لا تعرف من أين تبدأ؟</h3>
                <p>صف المشكلة بلغتك، ونساعدك في تحديد المطلوب.</p>
              </article>
              <article className="ss-promise-item">
                <Paperclip size={19} />
                <h3>ملفاتك في مكانها</h3>
                <p>أرسل المراجع والملفات التي تساعد على فهم طلبك.</p>
              </article>
              <article className="ss-promise-item">
                <MessageCircle size={19} />
                <h3>تواصل قريب</h3>
                <p>متابعة مباشرة معك عبر WhatsApp عند الحاجة.</p>
              </article>
              <article className="ss-promise-item">
                <WandSparkles size={19} />
                <h3>نتيجة قابلة للاستخدام</h3>
                <p>نرتب التسليم ليكون جاهزاً للخطوة التالية.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="ss-section ss-faq">
          <div className="ss-container ss-faq-layout">
            <div className="ss-faq-intro">
              <span className="ss-section-label">قبل أن تبدأ</span>
              <h2>أسئلة شائعة</h2>
              <p>إجابات مختصرة تساعدك على إرسال طلبك وأنت مطمئن.</p>
            </div>
            <div className="ss-faq-list">
              <details>
                <summary>هل أحتاج إلى معرفة اسم الخدمة؟</summary>
                <p>لا. اشرح ما تريد تحقيقه أو المشكلة التي تواجهك، وسنساعدك في تحديد الخدمة المناسبة.</p>
              </details>
              <details>
                <summary>كيف أرسل الملفات والمراجع؟</summary>
                <p>أرفق الملفات ذات الصلة أثناء تقديم الطلب. يمكنك إرسال الصور والمستندات والملفات الداعمة.</p>
              </details>
              <details>
                <summary>كيف يتم التواصل وتسليم النتيجة؟</summary>
                <p>يتم التنسيق معك عبر WhatsApp، ثم تصلك الملفات أو النتيجة الرقمية بعد إكمال الخدمة.</p>
              </details>
              <details>
                <summary>هل يمكنني طلب شيء غير موجود في القائمة؟</summary>
                <p>بالتأكيد. اكتب طلبك في النموذج، وسنراجع التفاصيل لنحدد كيف يمكننا مساعدتك.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="ss-container">
          <div className="ss-final-cta">
            <span className="ss-section-label">خطوتك الأولى تبدأ هنا</span>
            <h2>ما الذي تريد إنجازه اليوم؟</h2>
            <p>اكتب لنا ما تحتاجه، وسنبدأ من التفاصيل التي تهمك.</p>
            <PreviewLink href="/request" className="ss-button ss-button-primary">
              اطلب الخدمة الآن <ArrowLeft size={17} />
            </PreviewLink>
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