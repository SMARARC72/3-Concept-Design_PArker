import Hero from '../sections/Hero';
import CategoryNavigator from '../sections/CategoryNavigator';
import NewArrivals from '../sections/NewArrivals';
import SeasonalCampaign from '../sections/SeasonalCampaign';
import BestSellers from '../sections/BestSellers';
import FeaturedBrands from '../sections/FeaturedBrands';
import GiftGuide from '../sections/GiftGuide';
import FounderStory from '../sections/FounderStory';
import StoreLocations from '../sections/StoreLocations';
import EmailCapture from '../sections/EmailCapture';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryNavigator />
      <NewArrivals />
      <SeasonalCampaign />
      <BestSellers />
      <FeaturedBrands />
      <GiftGuide />
      <FounderStory />
      <StoreLocations />
      <EmailCapture />
    </>
  );
}
