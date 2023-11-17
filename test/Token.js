const { assert, expect } = require('chai');
const { utils } = require('ethers');
const { parseUnits } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
require("@nomicfoundation/hardhat-chai-matchers")

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token Contract Test', () => {
	let token,accounts,deployer,receiver

	beforeEach(async () => {		
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('VK Token', 'VKT', '1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]

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
		it('assigns total supply to deployer', async () => {
			//console.log(deployer);
			expect(Number(await token.balanceOf(deployer.address))).to.equal(Number(totalSupply))
		})
    })

	describe("Sending Tokens", () => {
		let amount, transaction, result

		describe('Success', () => {
			beforeEach(async () => {
				amount = tokens(100)
				transaction = await token.connect(deployer).transfer(receiver.address, amount)
				result = await transaction.wait()
			})
			it('transfers token balances', async () => {
				expect(Number(await token.balanceOf(deployer.address))).to.equal(Number(tokens(999900)))
				expect(Number(await token.balanceOf(receiver.address))).to.equal(Number(amount))
			})
			it('emits a Transfer event', async () => {
				const event = result.events[0]
				expect(event.event).to.equal('Transfer')

				const args = event.args
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(Number(args.value)).to.equal(Number(amount))
			})
		})


		describe('Failure', () => {
			it('rejects insufficient balances', async () => {
				const invalidAmount = tokens(1000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})
			it('rejects invalid recipient', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x2546BcD3c84621e976D8185a91A922aE77ECEc30', amount)).to.be.reverted
			})

		})

    })
	
})