import AuditInput from "./AuditInput";

export default function Hero() {
    return (
        <div className="text-center space-y-6 px-10 mb-10 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold">
                Track Your Competitors<br/>
                <span className="text-blue-500">24/7 with AI</span>
            </h1>
            <p className="text-xl text-zinc-400 pb-5">
                Know when competitors change their website, update pricing, or improve their SEO. 
                Get AI-powered strategic insights delivered to your inbox.
            </p>
            <div className="bg-zinc-800 p-6 rounded-lg mb-6">
                <p className="text-sm text-zinc-400 mb-4">
                    Try our free website auditor first:
                </p>
                <AuditInput />
            </div>
        </div>
    )
}