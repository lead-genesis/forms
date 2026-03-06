import { cn } from '@/lib/utils';
import Image from 'next/image';
import iconImage from '@/app/icon.png';

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn("w-10 h-10 relative flex items-center justify-center overflow-hidden", className)}>
            <Image src={iconImage} alt="Logo" className="object-contain" fill priority />
        </div>
    );
};

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <LogoIcon />
            <div className="text-[20px] font-sans tracking-[0.05em] text-foreground">
                <span className="font-normal">LEAD</span>
                <span className="font-bold">GENESIS</span>
            </div>
        </div>
    );
};
