"use client";
// import Image from "next/image";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { number, z } from "zod";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { Loader, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional()
    .or(z.literal("")),
  address: z.string(),
  items: z
    .array(
      z.object({
        name: z.string().min(2, {
          message: "Item name must be at least 2 letters",
        }),
        qnt: z.number().min(0, {
          message: "Must have at least one of the items",
        }),
        rate: z.number().min(1, {
          message: "Item must be at least $1",
        }),
      })
    )
    .min(1, {
      message: "Must have at least one item",
    }),
  shipping: z.coerce.number().min(0),
  paid: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  date: z.date({
    required_error: "An Invoice date required.",
  }),
});

type Item = z.infer<typeof formSchema>["items"][number];

type InvoiceType = z.infer<typeof formSchema>;

export type { InvoiceType };

export default function Home() {
  const [items, setItems] = useState<Item[]>([{ name: "", qnt: 0, rate: 0 }]);
  const [calcs, setCalcs] = useState({
    shipping: "0",
    subtotal: "0",
    total: "0",
    balance: "0",
  });
  const [loading, setLoading] = useState("false");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      items: items,
      shipping: 0,
      paid: 0,
      tax: 7.5,
      date: new Date()
    },
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { isValid, errors, isValidating, isDirty },
    reset,
  } = form;

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control,
  });

  const watchedItems = useWatch({ control, name: "items" });
  const watchedShipping = useWatch({ control, name: "shipping" });
  const watchedPaid = useWatch({ control, name: "paid" });
  const watchedTax = useWatch({ control, name: "tax" });

  const isSubmittable = !!isDirty && !!isValid;

  useEffect(() => {
    const new_tax = Number(watchedTax / 100);
    const items_total = watchedItems.reduce(
      (a, i) => a + Number(i.qnt * i.rate),
      0
    );
    const new_shipping = Number(watchedShipping);

    setCalcs({
      shipping: (new_shipping / (1 + new_tax)).toFixed(2),
      subtotal: ((items_total + new_shipping) / (1 + new_tax)).toFixed(2),
      total: (items_total + new_shipping).toFixed(2),
      balance: (items_total + new_shipping - watchedPaid).toFixed(2),
    });
  }, [watchedItems, watchedShipping, watchedPaid, watchedTax]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setItems(values.items);
    console.log(values);
    let id = "";

    setLoading("db");
    fetch("/api", {
      method: "POST",
      body: JSON.stringify(values),
    })
      .then((a) => a.json())
      .then((a) => {
        setLoading("pdf");
        id = a.id;
        return a;
      })
      .then((a) =>
        fetch("/api/genInvoice", {
          method: "POST",
          body: JSON.stringify(a),
        })
      )
      .then((ftch) => {
        setLoading("");
        return ftch.blob();
      })
      .then((fileBlob) => {
        var link = document.createElement("a"); // once we have the file buffer BLOB from the post request we simply need to send a GET request to retrieve the file data
        link.href = window.URL.createObjectURL(fileBlob);
        link.download = id + ".pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

    reset(values);
  }

  return (
    <div className="items-center justify-items-center min-h-screen h-fit p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-accent-foreground">
      <div className="h-auto aspect-[3/4] bg-white rounded-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-5"
          >
            <div className="flex gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder="Enter a phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errors?.items?.message ? (
              <p className="text-red-600">{errors?.items?.message}</p>
            ) : (
              <></>
            )}
            {fields.map((e, i) => {
              const errorForName = errors?.items?.[i]?.name;
              const errorForQnt = errors?.items?.[i]?.qnt;
              const errorForRate = errors?.items?.[i]?.rate;
              return (
                <Card className="w-full gap-2 py-4" key={i}>
                  <CardHeader className="justify-start">
                    <CardTitle className="w-fit">{`Item #${i + 1}`}</CardTitle>
                    <CardAction>
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => remove(i)}
                      >
                        <Trash />
                      </Button>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex justify-between gap-2">
                    <div className="w-1/2">
                      <FormItem className="w-full">
                        <FormLabel>Item name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={e.name}
                            {...register(`items.${i}.name` as const)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <p className="text-red-600">
                        {errorForName?.message ?? <>&nbsp;</>}
                      </p>
                    </div>
                    <div className="w-1/6">
                      <FormItem className="w-full">
                        <FormLabel>Qnt</FormLabel>
                        <FormControl>
                          <Input
                            {...register(`items.${i}.qnt` as const, {
                              valueAsNumber: true,
                            })}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <p className="text-red-600">
                        {errorForQnt?.message ?? <>&nbsp;</>}
                      </p>
                    </div>
                    <div className="w-1/6">
                      <FormItem className="w-full">
                        <FormLabel>Rate</FormLabel>
                        <FormControl>
                          <Input
                            {...register(`items.${i}.rate` as const, {
                              valueAsNumber: true,
                            })}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <p className="text-red-600">
                        {errorForRate?.message ?? <>&nbsp;</>}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <div className="flex w-full gap-5">
              <FormField
                control={form.control}
                name="shipping"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Shipping</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Amount already paid</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Tax rate</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: Date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loading == "false" ? (
              <div className="">
                <p>{`Shipping: ${calcs.shipping}`}</p>
                <p>{`Subtotal: ${calcs.subtotal}`}</p>
                <p>{`Total: ${calcs.total}`}</p>
                <p>{`Balance After Payment: ${calcs.balance}`}</p>
              </div>
            ) : loading == "db" ? (
              <div>
                <Loader className="animate-spin w-12 h-12 text-black" />
                <p>{`Uploading to Database`}</p>
              </div>
            ) : loading == "pdf" ? (
              <div>
                <Loader className="animate-spin w-12 h-12 text-black" />
                <p>{`Generating Invoice`}</p>{" "}
              </div>
            ) : (
              <Check></Check>
            )}

            <div className="flex flex-col h-full gap-3 w-fit">
              <Button
                type="button"
                onClick={() => {
                  append({
                    name: "",
                    qnt: 0,
                    rate: 0,
                  });
                }}
              >
                Add Another Item
              </Button>
              <Button type="submit" className="w-fit">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
