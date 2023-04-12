//// SPDX-License-Identifier: UNLICENSED
//pragma solidity >=0.4.22 <0.8.0;
//
//
//
//contract Election {
//
//    struct Candidate {
//        uint candidateId;
//        string candidateName;
//        uint candidateVotes;
//    }
//
//    mapping(uint => Candidate) public candidates;
//    mapping(address => bool) public voters;
//
//
//    uint public candidateCount;
//
//    constructor() public {
//        addCandidate("Candidate A");
//        addCandidate("Candidate B");
//    }
//
//    function addCandidate(string memory _candidateName) private {
//        candidateCount++;
//        candidates[candidateCount] = Candidate(candidateCount, _candidateName, 0);
//    }
//
//    function makeVote(uint _candidateId) public {
//        require(!voters[msg.sender]);
//
//        // require a valid candidate
//        require(_candidateId > 0 && _candidateId <= candidateCount);
//
//
//        candidates[_candidateId].candidateVotes++;
//        voters[msg.sender] = true;
//
//        emit voteEvent(_candidateId);
//    }
//
//
//
//    event voteEvent(uint indexed _candidateId);
//}
