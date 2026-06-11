import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { surfaceElevatedClassName } from '@/lib/surface';
import { cn } from '@/lib/utils';

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className={cn(surfaceElevatedClassName, 'w-full gap-0 py-0')}>
      <CardHeader className="items-center space-y-2 px-8 pt-10 pb-0 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight text-stone-900">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-base text-stone-500">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6 px-8 pt-8 pb-8">{children}</CardContent>
      <CardFooter className="justify-center border-t border-stone-200/60 bg-stone-50/50 px-8 py-4">
        <p className="text-xs font-medium tracking-wide text-stone-400 uppercase">
          Sistema interno seguro
        </p>
      </CardFooter>
    </Card>
  );
}
