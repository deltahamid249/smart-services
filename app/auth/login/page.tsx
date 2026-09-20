"use client";
import {FormEvent} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Login(){
const router=useRouter();
const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);const role=String(f.get("role"));localStorage.setItem("smart_user",JSON.stringify({name:f.get("name"),role}));router.push(role==="admin"?"/admin":"/dashboard")};
return <main className="auth"><div className="auth-box"><div className="auth-logo"><Link href="/" className="logo">الحلول <span>التقنية الذكية</span></Link></div><h1>تسجيل الدخول</h1><p className="form-sub">ادخل بياناتك للوصول إلى النظام.</p><form onSubmit={submit}><div className="field"><label>الاسم أو البريد الإلكتروني</label><input name="name" required/></div><div className="field"><label>كلمة المرور</label><input type="password" required/></div><div className="field"><label>نوع الحساب</label><select name="role"><option value="user">عميل</option><option value="admin">الإدارة</option></select></div><button className="btn btn-primary" style={{width:"100%"}}>دخول</button></form><div className="auth-footer"><Link href="/">العودة للرئيسية</Link></div></div></main>
}
