
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll respond shortly.",
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-center">
            Contact Us
          </h1>
          <p className="text-center text-gray-600 mt-2 max-w-2xl mx-auto">
            We're here to answer any questions you might have about our jewelry, services, or your order.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="font-playfair text-2xl font-bold mb-6">Get In Touch</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Visit Us</h3>
                <address className="not-italic text-gray-600">
                  123 Jewelry Lane<br />
                  San Francisco, CA 94110<br />
                  United States
                </address>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Contact</h3>
                <p className="text-gray-600">
                  Email: <a href="mailto:info@goldenthread.com" className="text-gold">info@goldenthread.com</a><br />
                  Phone: <a href="tel:+14155551234" className="text-gold">+1 (415) 555-1234</a>
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 9am - 6pm<br />
                  Saturday: 10am - 5pm<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block font-medium">
                    First Name
                  </label>
                  <Input id="firstName" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block font-medium">
                    Last Name
                  </label>
                  <Input id="lastName" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block font-medium">
                  Email
                </label>
                <Input id="email" type="email" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="block font-medium">
                  Subject
                </label>
                <Input id="subject" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block font-medium">
                  Message
                </label>
                <Textarea id="message" rows={5} required />
              </div>
              
              <Button type="submit" className="btn-gold w-full md:w-auto">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="h-96 bg-gray-200 mt-12">
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1088.016805241297!2d35.09680524523451!3d31.534830094201784!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502e7145a17c757%3A0xc48ac590e7550d76!2sRiver%20cafe!5e1!3m2!1sar!2str!4v1716587419374!5m2!1sar!2str"
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        </div>
      </div>
    </div>
  );
};

export default Contact;
