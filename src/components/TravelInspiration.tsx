
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  author_image?: string;
  published: boolean;
  created_at: string;
  position: number;
  category?: string;
  categories?: string[];
  editor_name?: string;
  date_written?: string;
  show_on_homepage?: boolean;
}

const TravelInspiration = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomepageBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog')
          .select('*')
          .eq('published', true)
          .eq('show_on_homepage', true)
          .order('position', { ascending: true })
          .limit(3);
        
        if (data) {
          setBlogPosts(data);
        } else if (error) {
          console.error('Error loading homepage blog posts:', error);
        }
      } catch (error) {
        console.error('Error in loadHomepageBlogPosts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageBlogPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 lg:pt-8 lg:pb-12 bg-gray-50">

<div className="max-w-7xl mx-auto px-4">

<div className="text-center mb-6 md:mb-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm mb-3 md:mb-4"
          >
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent-500 mr-1.5 md:mr-2" />
            <span className="text-gray-700 font-medium text-sm md:text-base">Expert Travel Content</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 md:mb-4"
          >
            Travel Inspiration{" "}
            <span className="bg-gradient-to-r from-[#f857a6] to-[#a75fff] bg-clip-text text-transparent">
              ✨
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4"
          >
            Discover travel tips, hidden gems, and budget-friendly hacks from our expert travelers.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/blog/${post.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                {post.image && (
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 md:h-48 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-2 md:top-3 lg:top-4 left-2 md:left-3 lg:left-4 bg-white/95 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium text-blue-600">
                  {post.categories && post.categories.length > 0 ? post.categories[0] : post.category || 'Travel Tips'}
                </div>
              </div>
              <div className="p-4 md:p-5 lg:p-6">
                <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 text-gray-900 line-clamp-2 leading-tight group-hover:text-travel-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-3 md:mb-4 line-clamp-3 text-xs md:text-sm lg:text-base leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 mr-2 md:mr-3">
                      {post.author_image ? (
                        <AvatarImage 
                          src={post.author_image} 
                          alt={post.author}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-travel-primary/20 text-travel-primary text-xs">
                        <User className="h-2 w-2 md:h-3 md:w-3 lg:h-4 lg:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs md:text-sm font-medium text-gray-700 truncate">{post.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.date_written || post.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6 md:mt-8 lg:mt-12">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            onClick={() => navigate('/blog')}
            className="inline-flex items-center justify-center px-5 md:px-6 lg:px-8 py-2.5 md:py-3 border-2 border-travel-primary text-travel-primary font-semibold rounded-full hover:bg-travel-primary hover:text-white transition-colors text-sm md:text-base"
          >
            Explore All Articles
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TravelInspiration;
