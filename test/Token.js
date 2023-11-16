const { expect } = require('chai');
const { utils } = require('ethers');
const { parseUnits } = require('ethers/lib/utils');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token Contract Test', () => {
	let token
	beforeEach(async () => {		
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('VK Token','VKT','1000000')
	})

	describe('Deployment', () => {
		const name = 'VK Token'
		const symbol = 'VKT'
		const decimals = '18'
		const totalSupply=tokens('1000000')
		it('has correct name', async () => {
			expect(await token.name()).to.equal(name)
		})
		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
		})
		it('has correct decimals', async () => {
			expect(Number(await token.decimals())).to.equal(Number(decimals))
		})
		it('has correct total supply', async () => {
			expect(Number(await token.totalSupply())).to.equal(Number(totalSupply))
		})
    })

	
})