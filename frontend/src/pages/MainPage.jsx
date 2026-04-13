import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Banner from "../components/Banner";
import Category from "../components/Category";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import { useProductSearch } from "../hooks/useProductSearch";

function MainPage() {
  const [selectedCategoryName, setSelectedCategoryName] = useState("カテゴリー");
  const [searchParams] = useSearchParams();

  const { products, loading, fetchProducts } = useProductSearch();

  useEffect(() => {
    const categoryId = searchParams.get("category"); 
    const searchTerm = searchParams.get("search");

    fetchProducts({ 
    category_id: categoryId || undefined, 
    name: searchTerm || undefined 
  });

    if (!categoryId) setSelectedCategoryName("カテゴリー");
  }, [searchParams, fetchProducts]);

  const handleSearchTrigger = (params) => {
    fetchProducts(params);
  };
  
  return (
    <>
      <Category 
        onSearch={handleSearchTrigger}
        onCategoryNameChange={setSelectedCategoryName}
      />
      <Banner />
      
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.7rem', margin: '25px 0' }}> {/*선택된 카테고리명 표시*/}
        {selectedCategoryName === 'カテゴリー' ? '全商品' : selectedCategoryName}
      </div>
      <ProductList products={products} loading={loading} />
      <Footer />
    </>
  );
}

export default MainPage;