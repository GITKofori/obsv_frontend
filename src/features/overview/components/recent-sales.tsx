import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Flame } from 'lucide-react';

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos gastos anuais de Gás</CardTitle>
        <CardDescription>Total por ano</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          <div className='flex items-center'>
            <Avatar className='h-9 w-9'>
              <Flame />
            </Avatar>
            <div className='ml-4 space-y-1'>
              <p className='text-sm font-medium leading-none'>2011</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='ml-auto font-medium'>+4919246.7</div>
          </div>
          <div className='flex items-center'>
            <Avatar className='h-9 w-9'>
              <Flame />
            </Avatar>
            <div className='ml-4 space-y-1'>
              <p className='text-sm font-medium leading-none'>2016</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='ml-auto font-medium'>+4803556.7</div>
          </div>
          <div className='flex items-center'>
            <Avatar className='h-9 w-9'>
              <Flame />
            </Avatar>
            <div className='ml-4 space-y-1'>
              <p className='text-sm font-medium leading-none'>2017</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='ml-auto font-medium'>+5935930.4</div>
          </div>
          <div className='flex items-center'>
            <Avatar className='h-9 w-9'>
              <Flame />
            </Avatar>
            <div className='ml-4 space-y-1'>
              <p className='text-sm font-medium leading-none'>2020</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='ml-auto font-medium'>+5652382.35</div>
          </div>
          <div className='flex items-center'>
            <Avatar className='h-9 w-9'>
              <Flame />
            </Avatar>
            <div className='ml-4 space-y-1'>
              <p className='text-sm font-medium leading-none'>2021</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='ml-auto font-medium'>+5441070.99</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
