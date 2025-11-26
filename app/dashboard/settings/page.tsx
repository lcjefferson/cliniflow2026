import { Metadata } from "next";
import { ClinicForm } from "@/components/settings/clinic-form";
import { OmnichannelSettings } from "@/components/settings/omnichannel-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
    title: "Configurações | Dental Clinic",
    description: "Gerencie as configurações da sua clínica",
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">
                    Gerencie os dados da sua clínica e preferências do sistema.
                </p>
            </div>

            <Tabs defaultValue="clinic" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="clinic">Dados da Clínica</TabsTrigger>
                    <TabsTrigger value="omnichannel">Omnichannel</TabsTrigger>
                </TabsList>

                <TabsContent value="clinic">
                    <ClinicForm />
                </TabsContent>

                <TabsContent value="omnichannel">
                    <OmnichannelSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
