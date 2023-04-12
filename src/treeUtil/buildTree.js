const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')

const leaves = ['0xBCE5B650F47fA5EBDD01Ea4c601c42ea8A047B2A'].map(x => SHA256(x))
const tree = new MerkleTree(leaves, SHA256)
const root = tree.getRoot().toString('hex')
const leaf = SHA256('0xBCE5B650F47fA5EBDD01Ea4c601c42ea8A047B2A')
const proof = tree.getProof(leaf)
console.log(tree.verify(proof, leaf, root))

console.log(tree.toString())
const buf2hex = x => '0x' + x.toString('hex')
console.log(buf2hex(tree.getRoot()));
