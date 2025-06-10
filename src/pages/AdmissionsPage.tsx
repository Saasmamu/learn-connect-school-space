
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  FileText, 
  Download, 
  Send,
  Clock,
  Users,
  Award,
  DollarSign
} from 'lucide-react';

export const AdmissionsPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    program: '',
    experience: '',
    motivation: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest. We will review your application and contact you soon.",
    });
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      program: '',
      experience: '',
      motivation: ''
    });
  };

  const programs = [
    {
      name: "Islamic Studies Diploma",
      duration: "2 Years",
      fee: "$1,200/year",
      description: "Comprehensive Islamic education covering Quran, Hadith, Fiqh, and Islamic History"
    },
    {
      name: "Quran Memorization (Hifz)",
      duration: "3-5 Years",
      fee: "$800/year",
      description: "Complete memorization of the Holy Quran with Tajweed"
    },
    {
      name: "Arabic Language Mastery",
      duration: "18 Months",
      fee: "$600/year",
      description: "Classical and modern Arabic language with grammar and literature"
    },
    {
      name: "Islamic Teacher Training",
      duration: "1 Year",
      fee: "$1,000/year",
      description: "Preparation for teaching Islamic subjects with modern pedagogical methods"
    }
  ];

  const requirements = [
    "Must be Muslim with basic knowledge of Islamic principles",
    "Minimum age of 16 years for diploma programs",
    "Basic literacy in Arabic alphabet (for Quran programs)",
    "Commitment to complete the chosen program duration",
    "Access to reliable internet connection for online classes",
    "Respectful attitude towards Islamic values and teachings"
  ];

  const process = [
    {
      step: 1,
      title: "Submit Application",
      description: "Complete and submit the online application form with required documents",
      icon: <Send className="h-6 w-6" />
    },
    {
      step: 2,
      title: "Document Review",
      description: "Our admissions team reviews your application and supporting documents",
      icon: <FileText className="h-6 w-6" />
    },
    {
      step: 3,
      title: "Interview Process",
      description: "Selected candidates will be invited for an online interview",
      icon: <Users className="h-6 w-6" />
    },
    {
      step: 4,
      title: "Acceptance & Enrollment",
      description: "Successful candidates receive acceptance letter and enrollment instructions",
      icon: <CheckCircle className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Join Our Islamic Academy
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Begin your journey of Islamic education with us. Apply now for our comprehensive 
            programs designed to deepen your knowledge and strengthen your faith.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Apply Now
            </Button>
            <Button variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Available Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of Islamic education programs designed for different levels and interests.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{program.duration}</Badge>
                    <div className="flex items-center text-emerald-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{program.fee}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{program.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {program.description}
                  </CardDescription>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Learn More & Apply
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Admission Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our straightforward admission process ensures we find the right students for our programs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements & Application Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Requirements */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Admission Requirements</h2>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-emerald-600" />
                    General Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-emerald-600" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Copy of valid ID or passport</li>
                    <li>• Educational certificates/transcripts</li>
                    <li>• Passport-size photograph</li>
                    <li>• Letter of motivation</li>
                    <li>• Previous Islamic education certificates (if any)</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download Document Checklist
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Application Form</h2>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Apply for Admission</CardTitle>
                  <CardDescription>
                    Fill out this form to begin your application process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="program">Preferred Program *</Label>
                      <Select onValueChange={(value) => handleInputChange('program', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program, index) => (
                            <SelectItem key={index} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Previous Islamic Education Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Describe any previous Islamic education or relevant experience..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivation">Why do you want to join our program? *</Label>
                      <Textarea
                        id="motivation"
                        value={formData.motivation}
                        onChange={(e) => handleInputChange('motivation', e.target.value)}
                        placeholder="Tell us about your motivation and goals..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with Your Application?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Our admissions team is here to help you through every step of the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Contact Admissions Office
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600">
              Schedule a Call
            </Button>
          </div>
          <div className="mt-8 text-emerald-100">
            <p>Email: admissions@islamicschool.edu | Phone: +1 (555) 123-4567</p>
          </div>
        </div>
      </section>
    </div>
  );
};
