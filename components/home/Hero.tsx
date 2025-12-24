import AuditInput from "./AuditInput";

export default function Hero() {
    return (
        <div className="text-center space-y-6 px-10 mb-10">
            <h1 className="text-4xl">Website Auditor</h1>
            <p className="text-2xl text-zinc-200 pb-5">Analyze your website for performance, SEO, and best practices.</p>
            <AuditInput />
        </div>
    )
}