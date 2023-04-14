pragma solidity >=0.4.22 <=0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Election is ERC721, Ownable {

    bytes32 public root;

    struct Candidate {
        uint candidateId;
        string candidateName;
        uint candidateVotes;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;


    uint public candidateCount;

    constructor(bytes32 _root) ERC721("MyToken", "MTK") public {
        root = _root;
        addCandidate("Joe Biden");
        addCandidate("Donald Trump");
        addCandidate("Barrack Obama");
        addCandidate("George Bush");
    }

    function addCandidate(string memory _candidateName) private {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _candidateName, 0);
    }

    function makeVote(uint _candidateId, bytes32[] memory proof) public {
        require(!voters[msg.sender]);

        require(_candidateId > 0 && _candidateId <= candidateCount);

        require(isValid(proof, keccak256(abi.encodePacked(msg.sender))), "Invalid Address");


    candidates[_candidateId].candidateVotes++;
        voters[msg.sender] = true;

        emit voteEvent(_candidateId);
    }

    function isValid(bytes32[] memory proof, bytes32 leaf) public view returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    event voteEvent(uint indexed _candidateId);
}
