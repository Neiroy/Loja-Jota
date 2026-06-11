import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 px-8 pt-8 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-stone-500">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8">{children}</CardContent>
    </Card>
  );
}
