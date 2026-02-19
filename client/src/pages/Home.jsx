import React from 'react';
import Hero from '../components/home/Hero';
import ActionCards from '../components/home/ActionCards';
import HowItWorks from '../components/home/HowItWorks';
import ChatPreview from '../components/home/ChatPreview';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
    return (
        <div className="bg-white min-h-screen font-sans">
            <Hero />
            <ActionCards />
            <HowItWorks />
            <ChatPreview />
            <Testimonials />
        </div>
    );
};

export default Home;
