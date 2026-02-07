import { useState } from "react";
import Category from "../components/Category";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";

function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("カテゴリー");

  // Category에서 검색어, 카테고리명, 카테고리id 모두 관리
  return (
    <>
      <Category 
        onCategoryChange={setSelectedCategory} //카테고리가 바뀔 때
        onSearch={setSearchText} //검색어가 바뀔 때
        selectedCategoryName={selectedCategoryName} //선택된 카테고리명
        setSelectedCategoryName={setSelectedCategoryName} //카테고리명 설정 함수
        onCategoryNameChange={setSelectedCategoryName} //카테고리명 변경 함수
      />
      <Banner />
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.7rem', margin: '25px 0' }}>
        {selectedCategoryName === 'カテゴリー' ? '全商品' : selectedCategoryName}
      </div>
      <ProductList categoryId={selectedCategory} searchText={searchText} />
      <Footer />
    </>
  );
}

export default MainPage;
 MainPage;
