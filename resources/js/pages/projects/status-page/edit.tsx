import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, Copy, ExternalLink, Globe2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function EditStatusPage({ statusPage }: any) {
    const { props }: any = usePage();
    const [copied, setCopied] = useState(false);
    const baseUrl = `/${props.currentTeam?.slug}/${props.currentProject?.slug}`;
    const form = useForm({
        enabled: Boolean(statusPage.enabled),
        slug: statusPage.slug,
        title: statusPage.title,
        show_heartbeats: Boolean(statusPage.show_heartbeats),
    });

    const copyUrl = async () => {
        if (!statusPage.public_url) {
            return;
        }

        await navigator.clipboard.writeText(statusPage.public_url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <>
            <Head title="Status page" />
            <div className="mx-auto max-w-3xl space-y-6">
                <header>
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-primary uppercase">
                        <Globe2 className="size-4" /> Public communication
                    </div>
                    <h1 className="text-3xl font-black tracking-[-0.04em]">
                        Status page
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Share availability without exposing private telemetry or
                        project credentials.
                    </p>
                </header>

                <form
                    className="tyto-panel space-y-6 p-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(`${baseUrl}/status-page`, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                        <div>
                            <Label htmlFor="enabled" className="font-bold">
                                Publish status page
                            </Label>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Disabled pages return 404 immediately.
                            </p>
                        </div>
                        <Switch
                            id="enabled"
                            checked={form.data.enabled}
                            onCheckedChange={(value) =>
                                form.setData('enabled', value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Public title</Label>
                        <Input
                            id="title"
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                        />
                        {form.errors.title && (
                            <p className="text-xs text-destructive">
                                {form.errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Public address</Label>
                        <div className="flex items-center rounded-md border bg-muted/30 pl-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
                            <span>/status/</span>
                            <Input
                                id="slug"
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                value={form.data.slug}
                                onChange={(event) =>
                                    form.setData(
                                        'slug',
                                        event.target.value.toLowerCase(),
                                    )
                                }
                            />
                        </div>
                        {form.errors.slug && (
                            <p className="text-xs text-destructive">
                                {form.errors.slug}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                        <div>
                            <Label htmlFor="heartbeats" className="font-bold">
                                Show heartbeat names
                            </Label>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Keep this off when task names reveal internal
                                details.
                            </p>
                        </div>
                        <Switch
                            id="heartbeats"
                            checked={form.data.show_heartbeats}
                            onCheckedChange={(value) =>
                                form.setData('show_heartbeats', value)
                            }
                        />
                    </div>

                    <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
                        <div className="flex gap-2">
                            {statusPage.public_url && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={copyUrl}
                                    >
                                        {copied ? <Check /> : <Copy />}{' '}
                                        {copied ? 'Copied' : 'Copy URL'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <a
                                            href={statusPage.public_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink /> Preview
                                        </a>
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button disabled={form.processing}>
                            Save status page
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
