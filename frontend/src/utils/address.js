export const fetchJapaneseAddress = async (zipCode) => { //日本郵便番号検索する関数
    const cleanZip = zipCode.toString().replace(/[^0-9]/g, ''); //数字のみを受け取る
    if (cleanZip.length !== 7) {//7桁の数字でのみ郵便番号を検索
        
        return;} 
    try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`); //api주소
        const data = await response.json();
        if (data.results) {
            const res = data.results[0];
            const fullAddr = `${res.address1}${res.address2}${res.address3}`;
            return{
                address: fullAddr,
                zip_code: cleanZip
            };
        } else {
            alert("該当する住所が見つかりませんでした。");
        }
    } catch (error) {
        console.error("Address fetch error:", error);
    }
	};