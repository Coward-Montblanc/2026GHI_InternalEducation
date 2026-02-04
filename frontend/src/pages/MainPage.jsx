import { useState } from "react";
import Category from "../components/Category";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";

function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <>
      <Category onCategoryChange={setSelectedCategory} />
      <Banner />
      <ProductList categoryId={selectedCategory} />
      <Footer />
    </>
  );
}

export default MainPage;
