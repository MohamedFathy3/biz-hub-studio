// pages/Jobs.tsx
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, Clock, Building2, Plus, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const jobTypes = ["All Jobs", "Full-time", "Part-time", "Remote", "Contract", "Internship"];

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Jobs");

  // Fetch jobs from API
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.post("/job-owner/index");
      setJobs(res.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
                           job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesType = typeFilter === "All Jobs" || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  const getJobTypeColor = (type: string) => {
    const colors: any = {
      "Full-time": "bg-blue-100 text-blue-800 border-blue-200",
      "Part-time": "bg-green-100 text-green-800 border-green-200",
      "Remote": "bg-purple-100 text-purple-800 border-purple-200",
      "Contract": "bg-orange-100 text-orange-800 border-orange-200",
      "Internship": "bg-pink-100 text-pink-800 border-pink-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
            <p className="text-gray-600 text-sm sm:text-base">Find your next career opportunity</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                className="pl-10 bg-white border-gray-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 sm:flex-initial relative min-w-[150px] sm:min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Location"
                className="pl-10 bg-white border-gray-300 w-full"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={fetchJobs}
              className="bg-[#039fb3] hover:bg-[#0288a1] w-full sm:w-auto"
            >
              Search Jobs
            </Button>
          </div>

          {/* Job Types Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {jobTypes.map((type, index) => (
              <Button
                key={index}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap flex-shrink-0 ${
                  typeFilter === type 
                    ? 'bg-[#039fb3] hover:bg-[#0288a1]' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039fb3]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Company Logo */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 mx-auto sm:mx-0">
                      {job.image ? (
                        <img
                          src={job.image}
                          alt={job.company?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header Section */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <Link 
                              to={`/jobs/${job.id}`}
                              className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-[#039fb3] transition-colors line-clamp-2"
                            >
                              {job.title}
                            </Link>
                            {job.available && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm whitespace-nowrap">
                                Open
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 text-sm">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{job.company?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex gap-2 justify-center sm:justify-start">
                          <Link to={`/job-applicants/${job.id}`} className="w-full sm:w-auto">
  <Button variant="outline" className="flex items-center gap-2 border-gray-300 w-full sm:w-auto text-xs sm:text-sm h-9">
    <Users size={14} />
    <span className="hidden xs:inline">Applications</span>
    <span className="xs:hidden">Apps</span>
  </Button>
</Link>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm sm:text-base">
                        {job.description}
                      </p>
                      
                      {/* Job Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${getJobTypeColor(job.type)} border text-xs`}>
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.type}
                          </Badge>
                          <span className="flex items-center gap-1 font-semibold text-green-600 text-sm">
                            <DollarSign size={14} />
                            {job.salary}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                          {job.company?.industry} • {job.company?.size}
                        </div>
                      </div>

                      {/* Company Details */}
                      {job.company && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            {job.company?.location && (
                              <span className="flex items-center gap-1">
                                📍 {job.company.location}
                              </span>
                            )}
                            {job.company?.founded && (
                              <span className="flex items-center gap-1">
                                🏢 {job.company.founded}
                              </span>
                            )}
                            {job.company?.website && (
                              <span className="flex items-center gap-1">
                                🌐 {job.company.website}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-base sm:text-lg">No jobs found matching your criteria.</p>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">Try adjusting your search filters</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Jobs;