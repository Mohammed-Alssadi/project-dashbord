import type { StoreSocialLinks } from '../types/storeProfile.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Share2, MessageCircle, Send, Navigation } from 'lucide-react';

interface StoreSocialCardProps {
  social: StoreSocialLinks;
}

export function StoreSocialCard({ social }: StoreSocialCardProps) {
  const socialLinks = [
    { key: 'whatsapp', name: 'واتساب', value: social.whatsapp, icon: MessageCircle, color: 'text-green-500' },
    { key: 'twitter', name: 'تويتر (X)', value: social.twitter, icon: TwitterIcon, color: 'text-black dark:text-white' },
    { key: 'instagram', name: 'انستقرام', value: social.instagram, icon: InstagramIcon, color: 'text-pink-600' },
    { key: 'facebook', name: 'فيسبوك', value: social.facebook, icon: FacebookIcon, color: 'text-blue-600' },
    { key: 'snapchat', name: 'سناب شات', value: social.snapchat, icon: Navigation, color: 'text-yellow-500' },
    { key: 'youtube', name: 'يوتيوب', value: social.youtube, icon: YoutubeIcon, color: 'text-red-500' },
    { key: 'telegram', name: 'تيليجرام', value: social.telegram, icon: Send, color: 'text-blue-400' },
    { key: 'maroof', name: 'معروف', value: social.maroof, icon: ShieldCheckIcon, color: 'text-emerald-500' },
  ];

  const activeLinks = socialLinks.filter(link => link.value);

  return (
    <Card className="shadow-sm border-border/60 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-500" />
          حسابات التواصل
        </CardTitle>
        <CardDescription>طرق التواصل المتاحة للعملاء</CardDescription>
      </CardHeader>
      <CardContent>
        {activeLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeLinks.map((link) => (
              <a
                key={link.key}
                href={link.value!.startsWith('http') ? link.value : `https://${link.value}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-full bg-muted flex items-center justify-center ${link.color}`}>
                  <link.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold">{link.name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-full" dir="ltr">
                    {link.value}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/60 rounded-xl bg-muted/10">
            <Share2 className="h-8 w-8 mb-3 opacity-20" />
            <p className="text-sm">لم يتم إضافة حسابات تواصل اجتماعي للمتجر</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TwitterIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

// أداة لتعويض أيقونة معروف
function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
