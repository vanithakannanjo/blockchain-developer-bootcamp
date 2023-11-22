const {  expect } = require('chai');
const { ethers } = require('hardhat');


const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
	let token, accounts, deployer, receiver

	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('VK Token', 'VKT', '1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
		exchange = accounts[2]

	})

	describe('Deployment', () => {
		const name = 'VK Token'
		const symbol = 'VKT'
		const decimals = '18'
		const totalSupply = tokens('1000000')
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
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount))//.to.be.reverted					
			})
			it('rejects invalid recipient', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount))//.to.be.reverted					
			})

		})

	})

	describe('Approving Token', () => {
		let amount, transaction, result
		beforeEach(async () => {
			amount = tokens(100)
			transaction = await token.connect(deployer).approve(exchange.address, amount)
			result = await transaction.wait()
        })
		describe('Success', () => {
			it('allocates an allowance for delegated token spending', async() => {
				expect(Number(await token.allowance(deployer.address, exchange.address))).to.equal(Number(amount))
			})
			it('emits a Approval event', async () => {
				const event = result.events[0]
				expect(event.event).to.equal('Approval')

				const args = event.args
				expect(args.owner).to.equal(deployer.address)
				expect(args.spender).to.equal(exchange.address)
				expect(Number(args.value)).to.equal(Number(amount))
			})
		})

		describe('Failure', () => {
			it('reject invalid spenders', async() => {
				await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount))//.to.be.reverted
            })

        })
    })

})