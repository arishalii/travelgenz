
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
    <section className="py-12 md:pt-8 md:pb-12 bg-gray-50">

<div className="max-w-7xl mx-auto px-0">

<div className="text-center mb-8 md:mb-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm mb-4"
          >
            <Sparkles className="h-5 w-5 text-accent-500 mr-2" />
            <span className="text-gray-700 font-medium">Expert Travel Content</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold mb-2 md:mb-4"
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
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover travel tips, hidden gems, and budget-friendly hacks from our expert travelers.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                    className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-white/95 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium text-blue-600">
                  {post.categories && post.categories.length > 0 ? post.categories[0] : post.category || 'Travel Tips'}
                </div>
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 line-clamp-2 leading-tight group-hover:text-travel-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-3 md:mb-4 line-clamp-3 text-sm md:text-base leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3">
                      {post.author_image ? (
                        <AvatarImage 
                          src={post.author_image} 
                          alt={post.author}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-travel-primary/20 text-travel-primary text-xs md:text-sm">
                        <User className="h-3 w-3 md:h-4 md:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs md:text-sm font-medium text-gray-700">{post.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs md:text-sm">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {formatDate(post.date_written || post.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            onClick={() => navigate('/blog')}
            className="inline-flex items-center justify-center px-6 md:px-8 py-3 border-2 border-travel-primary text-travel-primary font-semibold rounded-full hover:bg-travel-primary hover:text-white transition-colors"
          >
            Explore All Articles
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TravelInspiration;
