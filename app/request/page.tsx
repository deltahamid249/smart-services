"use client";
import {FormEvent,useState} from "react";
import Link from "next/link";

export default function RequestPage(){
const [sent,setSent]=useState(false);const [id,setId]=useState("");
const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);const requestId="REQ-"+Date.now().toString().slice(-8);const item={id:requestId,name:f.get("name"),whatsapp:f.get("whatsapp"),service:f.get("service"),details:f.get("details"),date:new Date().toISOString(),status:"جديد"};const old=JSON.parse(localStorage.getItem("smart_requests")||"[]");localStorage.setItem("smart_requests",JSON.stringify([item,...old]));setId(requestId);setSent(true)};
if(sent)return <main className="page"><div className="form-wrap"><h1>تم إرسال الطلب بنجاح ✓</h1><p className="form-sub">تم تسجيل طلبك في النظام.</p><div className="notice success">رقم الطلب: <strong>{id}</strong><br/>احتفظ بهذا الرقم لمتابعة طلبك.</div><div className="actions"><Link href="/dashboard" className="btn btn-primary">متابعة طلباتي</Link><Link href="/" className="btn btn-secondary">الرئيسية</Link></div></div></main>;
return <>
<header className="header"><div className="container nav"><Link href="/" className="logo">الحلول <span>التقنية الذكية</span></Link><nav className="navlinks"><Link href="/">الرئيسية</Link><Link href="/services">الخدمات</Link><Link href="/request" className="active">طلب خدمة</Link><Link href="/auth/login">تسجيل الدخول</Link></nav></div></header>
<main className="page"><div className="form-wrap"><h1>طلب خدمة</h1><p className="form-sub">اكتب ما تحتاجه بالتفصيل، حتى إذا لم تعرف اسم الخدمة.</p><div className="notice">أدخل رقم WhatsApp صحيحًا حتى نتمكن من التواصل معك.</div>
<form onSubmit={submit}>
<div className="field"><label>الاسم الكامل</label><input name="name" required placeholder="مثال: محمد أحمد"/></div>
<div className="field"><label>رقم WhatsApp</label><input name="whatsapp" required placeholder="249xxxxxxxxx"/></div>
<div className="field"><label>الخدمة المطلوبة</label><select name="service"><option>طلب مخصص</option><option>التصميم الجرافيكي</option><option>المواقع الإلكترونية</option><option>تطبيقات الهاتف</option><option>الملفات والمستندات</option><option>Excel وقواعد البيانات</option><option>البرمجة والحلول التقنية</option><option>الاستضافة والنشر</option><option>الخدمات الأكاديمية التقنية</option></select></div>
<div className="field"><label>تفاصيل الطلب</label><textarea name="details" required placeholder="اشرح لنا بالتفصيل ماذا تريد أن ننجز لك..."/></div>
<div className="field"><label>إرفاق الملفات</label><div className="file-box"><input type="file" multiple/><p style={{color:"#64748b",fontSize:13}}>يمكنك إرفاق الصور وPDF وWord وPowerPoint وغيرها.</p></div></div>
<button className="btn btn-primary" type="submit">إرسال الطلب</button>
</form></div></main>
</>}
