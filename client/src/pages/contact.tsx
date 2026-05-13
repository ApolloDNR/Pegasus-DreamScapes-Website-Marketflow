import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { insertContactSchema, type InsertContact, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import {
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building,
  Briefcase,
  MessageSquare,
  Phone,
} from "lucide-react";
import heroImage from "@assets/generated_images/luxury_home_at_dusk_with_warm_lighting.png";

const contactFormSchema = insertContactSchema.extend({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Please provide a subject"),
  message: z.string().min(10, "Please share a few more details"),
});

export default function Contact() {
  useSEO({
    title: "Contact — Pegasus Dreamscapes",
    description: "Submit a property, start a private partner conversation, or ask a question. Every message gets a real, direct response.",
  });

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Contact Pegasus Dreamscapes</h1>
      <HeroSection />
      <ContactRoutingSection />
      <ContactFormSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-black/85" />

      <div className="relative z-10 w-full py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-champagne" />
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70 font-medium">Open Channel</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-champagne" />
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            data-testid="text-contact-hero"
          >
            Start a real<br />
            <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">conversation.</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            Submit a property, open a private partner conversation, or just ask a question. Every message gets a direct, honest response. No funnels, no auto-replies.
          </motion.p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-tan to-champagne" />
    </section>
  );
}

function ContactRoutingSection() {
  const lanes = [
    {
      icon: Building,
      kicker: "Sellers",
      title: "Have a property?",
      desc: "Submit it through the structured intake. Reviewed and routed within 24 business hours.",
      cta: "Submit a Property",
      href: "/sell",
    },
    {
      icon: Briefcase,
      kicker: "Capital",
      title: "Partner inquiry?",
      desc: "Start a private conversation about deal-specific structures and active opportunities.",
      cta: "Partner Inquiry",
      href: "/invest",
    },
    {
      icon: MessageSquare,
      kicker: "Everything else",
      title: "General question?",
      desc: "Press, partnerships, MarketFlow access requests, or anything that doesn't fit a box, use the form below.",
      cta: "Use the Form",
      href: "#contact-form",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Choose Your Lane</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Three ways to reach us.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Routing the right way gets you the right answer faster.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {lanes.map((lane, i) => {
            const isExternal = lane.href.startsWith("/");
            const Card = (
              <motion.div
                className="group h-full p-8 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`contact-lane-${i}`}
              >
                <div className="flex items-baseline justify-between mb-7">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold">{lane.kicker}</p>
                  <lane.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-4 tracking-tight">{lane.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">{lane.desc}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-primary font-semibold inline-flex items-center gap-2">
                  {lane.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            );
            return isExternal ? (
              <Link key={i} href={lane.href}>{Card}</Link>
            ) : (
              <a key={i} href={lane.href}>{Card}</a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactFormSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertContact>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const unifiedLead: Partial<InsertLead> = {
        leadType: 'contact',
        source: 'contact_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone || undefined,
        leadData: { subject: data.subject, message: data.message },
        notes: data.message,
      };

      return await apiRequest("POST", "/api/leads", unifiedLead);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Message Sent", description: "We'll get back to you within 1–2 business days." });
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again or email us directly.", variant: "destructive" });
    },
  });

  const contactInfo = [
    { icon: Mail, label: "Email", value: "apollo@pegasusdreamscapes.com", href: "mailto:apollo@pegasusdreamscapes.com" },
    { icon: Phone, label: "Direct", value: "925-948-6566", href: "tel:+19259486566" },
    { icon: MapPin, label: "Based in", value: "Bay Area, California", href: null },
    { icon: Clock, label: "Response Time", value: "Within 1–2 business days", href: null },
  ];

  return (
    <section id="contact-form" className="py-28 lg:py-36 bg-card border-y border-border/40 scroll-mt-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <ScrollReveal className="lg:col-span-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Send a Message</p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6 tracking-[-0.02em]" data-testid="text-contact-info-title">
            Plain-text reaches us fastest.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            Use the form for press, partnerships, MarketFlow access, or anything else that doesn't fit a structured intake. A real person reads every message.
          </p>

          <div className="space-y-1">
            {contactInfo.map((item, i) => (
              <div key={i} className="flex items-center gap-5 py-5 border-b border-border/40 last:border-0" data-testid={`contact-info-${i}`}>
                <item.icon className="w-5 h-5 text-primary/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1 font-semibold">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-serif text-lg hover:text-primary transition-colors" data-testid={`link-contact-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-serif text-lg">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-7" delay={0.15}>
          {submitted ? (
            <div className="p-10 lg:p-14 bg-background rounded-2xl border border-border/50 shadow-xl text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-8" />
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Received</p>
              <h3 className="font-serif text-3xl font-semibold mb-5 tracking-tight" data-testid="text-contact-success">
                Thank you.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your message is in. A real person will read it and follow up within 1–2 business days.
              </p>
            </div>
          ) : (
            <div className="p-8 lg:p-10 bg-background rounded-2xl border border-border/50 shadow-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Smith" {...field} data-testid="input-contact-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-contact-email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl><Input placeholder="Best callback number" {...field} value={field.value ?? ""} data-testid="input-contact-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input placeholder="What's this about?" {...field} data-testid="input-contact-subject" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what's on your mind."
                          className="min-h-40 resize-none"
                          {...field}
                          data-testid="textarea-contact-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-sm uppercase tracking-[0.15em] font-semibold py-7"
                    disabled={mutation.isPending}
                    data-testid="button-send-message"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                      <>Send Message<ArrowRight className="ml-3 w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
