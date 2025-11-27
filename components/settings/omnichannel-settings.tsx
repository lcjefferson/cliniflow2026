'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Instagram, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OmnichannelSettings {
    whatsappToken?: string;
    whatsappPhoneNumberId?: string;
    whatsappWebhookToken?: string;
    instagramAccessToken?: string;
    instagramAccountId?: string;
}

export function OmnichannelSettings() {
    const [settings, setSettings] = useState<OmnichannelSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
    const [copiedInstagram, setCopiedInstagram] = useState(false);

    const whatsappWebhookUrl = `${window.location.origin}/api/omnichannel/webhooks/whatsapp`;
    const instagramWebhookUrl = `${window.location.origin}/api/omnichannel/webhooks/instagram`;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings({
                    whatsappToken: data.whatsappToken || '',
                    whatsappPhoneNumberId: data.whatsappPhoneNumberId || '',
                    whatsappWebhookToken: data.whatsappWebhookToken || '',
                    instagramAccessToken: data.instagramAccessToken || '',
                    instagramAccountId: data.instagramAccountId || '',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                toast.success('Configurações salvas com sucesso!');
            } else {
                toast.error('Erro ao salvar configurações');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = async (text: string, type: 'whatsapp' | 'instagram') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'whatsapp') {
                setCopiedWhatsApp(true);
                setTimeout(() => setCopiedWhatsApp(false), 2000);
            } else {
                setCopiedInstagram(true);
                setTimeout(() => setCopiedInstagram(false), 2000);
            }
            toast.success('URL copiada!');
        } catch {
            toast.error('Erro ao copiar URL');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* WhatsApp Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>WhatsApp Business</CardTitle>
                            <p className="text-sm text-gray-600">Configure a integração com WhatsApp</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Token
                        </label>
                        <input
                            type="password"
                            className="input-premium w-full"
                            placeholder="EAAxxxxxxxxxx..."
                            value={settings.whatsappToken || ''}
                            onChange={(e) => setSettings({ ...settings, whatsappToken: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Token de acesso do Meta Business (WhatsApp)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number ID
                        </label>
                        <input
                            type="text"
                            className="input-premium w-full"
                            placeholder="123456789012345"
                            value={settings.whatsappPhoneNumberId || ''}
                            onChange={(e) => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ID do número de telefone no WhatsApp Business
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook Token
                        </label>
                        <input
                            type="text"
                            className="input-premium w-full"
                            placeholder="seu_token_secreto"
                            value={settings.whatsappWebhookToken || ''}
                            onChange={(e) => setSettings({ ...settings, whatsappWebhookToken: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Token para verificação do webhook (escolha um valor secreto)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input-premium w-full"
                                value={whatsappWebhookUrl}
                                readOnly
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => copyToClipboard(whatsappWebhookUrl, 'whatsapp')}
                            >
                                {copiedWhatsApp ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Use esta URL no Meta App para configurar o webhook
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <Badge variant={settings.whatsappToken && settings.whatsappPhoneNumberId ? 'success' : 'default'}>
                            {settings.whatsappToken && settings.whatsappPhoneNumberId ? 'Configurado' : 'Não configurado'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Instagram Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                            <Instagram className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Instagram Business</CardTitle>
                            <p className="text-sm text-gray-600">Configure a integração com Instagram</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Token
                        </label>
                        <input
                            type="password"
                            className="input-premium w-full"
                            placeholder="EAAxxxxxxxxxx..."
                            value={settings.instagramAccessToken || ''}
                            onChange={(e) => setSettings({ ...settings, instagramAccessToken: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Token de acesso do Meta Business (Instagram)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram Account ID
                        </label>
                        <input
                            type="text"
                            className="input-premium w-full"
                            placeholder="123456789012345"
                            value={settings.instagramAccountId || ''}
                            onChange={(e) => setSettings({ ...settings, instagramAccountId: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ID da conta Instagram Business
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input-premium w-full"
                                value={instagramWebhookUrl}
                                readOnly
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => copyToClipboard(instagramWebhookUrl, 'instagram')}
                            >
                                {copiedInstagram ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Use esta URL no Meta App para configurar o webhook (use o mesmo token do WhatsApp)
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <Badge variant={settings.instagramAccessToken && settings.instagramAccountId ? 'success' : 'default'}>
                            {settings.instagramAccessToken && settings.instagramAccountId ? 'Configurado' : 'Não configurado'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        'Salvar Configurações'
                    )}
                </Button>
            </div>
        </div>
    );
}
