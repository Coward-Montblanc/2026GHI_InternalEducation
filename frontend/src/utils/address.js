export const fetchJapaneseAddress = async (zipCode) => { //일본 우편번호 검색하는 함수
    const cleanZip = zipCode.toString().replace(/[^0-9]/g, ''); //숫자만 입력받음
    if (cleanZip.length !== 7) {//7자리 숫자로만 우편번호 검색
        
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