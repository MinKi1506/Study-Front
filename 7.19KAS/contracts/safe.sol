//SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 < 0.8.0;

contract safe{
    uint32 count; //배열의 개수

    struct check_list{ // 점검사항을 담아두는 구조체
        address checker; //점검자의 지갑주소
        string num; //점검할 리뷰의 번호
        string result; //점검 결과
        string date; //점검 시간
    }

    mapping(string => check_list) internal lists; // lists에서 string을 키값으로 check_list를 맵핑한다(찾는다)

    check_list[] internal checks; //구조체를 배열로 선언ㅇ

    function add_check(address _checker, string memory _num, string memory _result, string memory _date) public {
        count++;
        checks.push(check_list(_checker, _num, _result, _date));
        lists[_num].checker = _checker;
        lists[_num].num = _num;
        lists[_num].result = _result;
        lists[_num].date = _date;
    }

    //총 리뷰의 갯수 조회하기
    function total_count() public view returns(uint32){
        return count;
    }

    //해당 리뷰 인덱스의 점검 상세 내용 조회하기
    function get_checks(uint _index) public view returns (address, string memory, string memory, string memory){
        return (checks[_index].checker, checks[_index].num, checks[_index].result, checks[_index].date);
    }

    //해당 리뷰 번호의 점검 리스트 조회하기
    function get_list(string memory _num) public view returns (address, string memory, string memory){
        return (lists[_num].checker, lists[_num].result, lists[_num].date); 
    }
}