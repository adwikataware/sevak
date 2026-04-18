import { getWhatsappLogs } from "@/app/actions/get-whatsapp-logs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Image as ImageIcon, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

function obscurePhone(phone: string) {
  if (!phone || phone.length < 10) return phone;
  // Keeps country code, masks middle, shows last 4 digits
  // Example: +1234567890 -> +1xxxxx7890
  const lastFour = phone.slice(-4);
  const prefix = phone.slice(0, Math.max(3, phone.length - 8)); // roughly gives first 2-3 digits
  const masked = "x".repeat(phone.length - prefix.length - 4);
  return `${prefix}${masked}${lastFour}`;
}

export default async function WhatsappLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Automatically read the city_slug from the admin's authenticated metadata.
  const city = user.user_metadata?.city_slug || "";
  const role = user.user_metadata?.role || "officer";

  // If superadmin/commissioner, maybe they see everything, otherwise filter
  const fetchCity = role === "commissioner" ? undefined : city;

  const { data: logs, error } = await getWhatsappLogs(fetchCity);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Communications</h1>
          <p className="text-muted-foreground mt-1 text-lg">Tracing of important AI interactions with citizens</p>
        </div>

        {/* Display Secure Logged In Context Instead of Bypass */}
        <div className="flex flex-col items-end">
           <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
             <MapPin className="h-3 w-3 mr-1" />
             {city ? city.toUpperCase() : "GLOBAL"} Region
           </span>
           <span className="text-xs text-muted-foreground mt-1 text-right">
             Logged in as {user.user_metadata?.full_name || user.email}
           </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interaction Logs</CardTitle>
          <CardDescription>
            Chronological log of WhatsApp conversations handled by the AI agent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Citizen (Phone)</TableHead>
                  <TableHead className="w-1/3">Citizen Sent</TableHead>
                  <TableHead className="w-1/3">AI Replied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!logs || logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                      {error ? `Error loading logs: ${error}` : "No WhatsApp logs found yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-sm">
                          {obscurePhone(log.user_phone)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm border-l-2 border-gray-200 pl-2 text-gray-700 italic">
                            {log.message_received || "(No text)"}
                          </div>
                          {log.media_url && (
                            <a href={log.media_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-500 hover:underline">
                              <ImageIcon className="w-3 h-3 mr-1" /> View Media
                            </a>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm bg-blue-50 text-blue-800 p-2 rounded-md">
                            <span className="flex items-center gap-1 font-semibold text-xs mb-1">
                              <MessageSquare className="w-3 h-3" /> Agent
                            </span>
                            {log.ai_reply}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
