'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import toast from "react-hot-toast";
import axios from "axios";
import {useRouter} from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required'
  })
});

interface TitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
}

const TitleForm = ({ initialData, courseId }: TitleFormProps) => {

  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title
    }
  });

  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('Course updated');
      toggleEdit();

      router.refresh();
    } catch (e) {
      toast.error('Something went wrong');
    }
  };

  const toggleEdit = () => setIsEditing((prev) => !prev);

  return (
    <div className={'mt-6 border bg-slate-100 rounded-md p-4'}>
      <div className={'font-medium flex items-center justify-between'}>
        Course title
        <Button onClick={toggleEdit} variant={'ghost'}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className={'h-4 w-4 mr-2'} />
              Edit title
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className={'text-sm mt-2'}>{initialData.title}</p>}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-4 mt-4'}>
            <FormField
              control={form.control}
              name={'title'}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder={"e.g. 'Advanced Web Development'"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={'flex items-center gap-x-2'}>
              <Button disabled={!isValid || isSubmitting} type={'submit'}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default TitleForm;
