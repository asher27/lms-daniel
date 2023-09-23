'use client';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface CourseEnrollButtonProps {
  courseId: string;
  price: number;
}

const CourseEnrollButton = ({ courseId, price }: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(`/api/courses/${courseId}/checkout`);

      window.location.assign(response.data.url);
    } catch (e) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button disabled={isLoading} onClick={onClick} size={'sm'} className={'w-full md:w-auto'}>
      Enroll for {formatPrice(price)}
    </Button>
  );
};

export default CourseEnrollButton;
