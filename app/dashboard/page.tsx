"use client";
import {useEffect,useState} from "react";
import Link from "next/link";

export default function Dashboard(){
const [requests,setRequests]=useState<any[]>([]);
useEffect(()=>setRequests(JSON.parse(localStorage.getItem("smart_requests")||"[]")),[]);
return <><header className="header"><div className="container nav"><Link href="/" className="logo">الحلول <span>التقنية الذكية</span></Link><nav className="navlinks"><Link href="/">الرئيسية</Link><Link href="/request" className="nav-cta">طلب جديد</Link></nav></div></header>
<main className="dashboard"><div className="container"><div className="dashboard-head"><div><h1>حساب العميل</h1><p>متابعة طلباتك وحالتها.</p></div><Link href="/request" className="btn btn-primary">+ طلب جديد</Link></div>
<div className="stats"><div className="stat"><small>إجمالي الطلبات</small><strong>{requests.length}</strong></div><div className="stat"><small>طلبات جديدة</small><strong>{requests.filter(x=>x.status==="جديد").length}</strong></div><div className="stat"><small>قيد التنفيذ</small><strong>{requests.filter(x=>x.status==="قيد التنفيذ").length}</strong></div><div className="stat"><small>تم التسليم</small><strong>{requests.filter(x=>x.status==="تم التسليم").length}</strong></div></div>
<div className="table-card">{requests.length===0?<div className="empty">لا توجد طلبات حتى الآن.<br/><Link href="/request" className="card-link">ابدأ أول طلب لك ←</Link></div>:<table className="table"><thead><tr><th>رقم الطلب</th><th>الخدمة</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>{requests.map(r=><tr key={r.id}><td className="request-id">{r.id}</td><td>{r.service}</td><td>{new Date(r.date).toLocaleDateString("ar-SD")}</td><td><span className="status">{r.status}</span></td></tr>)}</tbody></table>}</div>
</div></main></>
}
