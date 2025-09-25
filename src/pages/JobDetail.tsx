import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  Share2,
  Heart,
  ArrowLeft
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const JobDetail = () => {
  const { id } = useParams();

  // Mock job data - in a real app, this would be fetched based on the ID
  const job = {
    id: 1,
    title: "Senior Frontend Developer",
    clinck: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    postedDate: "2 days ago",
    applicants: 45,
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=926&q=80",
    avalibel: false,
    isavalibel: true,
    description: `We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining user-facing applications using modern web technologies.

This is an excellent opportunity to work with a talented team on cutting-edge projects that impact millions of users worldwide.`,
    
    responsibilities: [
      "Develop and maintain responsive web applications using React and TypeScript",
      "Collaborate with designers and backend developers to implement new features",
      "Optimize application performance and ensure cross-browser compatibility",
      "Participate in code reviews and mentor junior developers",
      "Stay up-to-date with the latest frontend technologies and best practices"
    ],
    
    requirements: [
      "5+ years of experience in frontend development",
      "Strong proficiency in React, TypeScript, and modern JavaScript",
      "Experience with state management libraries (Redux, Zustand, etc.)",
      "Knowledge of CSS preprocessors and modern CSS features",
      "Familiarity with testing frameworks (Jest, React Testing Library)",
      "Experience with version control systems (Git)",
      "Strong problem-solving skills and attention to detail"
    ],
    
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "Flexible work schedule and remote work options",
      "Professional development budget",
      "Catered lunches and snacks",
      "Modern office space in downtown San Francisco"
    ],
    
    clinckInfo: {
      size: "200-500 employees",
      industry: "Technology",
      founded: "2015",
      website: "www.techcorp.com",
      locationClinck:"ciro"
    },
     profile: {
      name: "mohamed",
      postion: "Technology",
      iamge:'avter'
    }
  
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={job.logo}
                        alt={job.clinck}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        {job.isavalibel && (
                          <Badge className="bg-warning">isavalibel</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.clinck}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Posted {job.postedDate}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-success" />
                    <div className="font-semibold">{job.salary}</div>
                    <div className="text-sm text-muted-foreground">Salary</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Briefcase className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{job.type}</div>
                    <div className="text-sm text-muted-foreground">Job Type</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-warning" />
                    <div className="font-semibold">{job.applicants}</div>
                    <div className="text-sm text-muted-foreground">Applicants</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{job.postedDate}</div>
                    <div className="text-sm text-muted-foreground">Posted</div>
                  </div>
                </div>

                <Separator />

                {/* Job Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                <Separator />

                {/* Responsibilities */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Key Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Requirements */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Benefits */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Benefits & Perks</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Apply Card */}
            <Card>
              <CardContent className="p-6">
                <Button className="w-full mb-4" size="lg">
                  Apply for this Job
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Apply now to join an amazing team
                </p>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.clinck}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Size</span>
                  <span className="font-medium">{job.clinckInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{job.clinckInfo.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Founded</span>
                  <span className="font-medium">{job.clinckInfo.founded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website</span>
                  <span className="font-medium text-primary">{job.clinckInfo.website}</span>
                </div>
                   <div className="flex justify-between">
                  <span className="text-muted-foreground">locationClinck</span>
                  <span className="font-medium text-primary">{job.clinckInfo.locationClinck}</span>
                </div>
              </CardContent>
            </Card>locationClinck

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded bg-muted"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Frontend Developer</h4>
                      <p className="text-sm text-muted-foreground">StartupXYZ</p>
                      <p className="text-sm text-success">$80k - $100k</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;