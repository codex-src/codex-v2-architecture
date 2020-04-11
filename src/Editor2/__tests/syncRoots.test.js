import React from "react"
import renderDOM from "renderDOM"
import syncRoots from "../syncRoots"

document.getSelection = () => ({
	rangeCount: 1,
	removeAllRanges: () => {
		// No-op
	},
})

// group 1
//
// - -
//
// - a
//
// a -
//
// a a
//
describe("group 1", () => {
	test("", () => {
		const Component1 = props => (
			<div>
				{/* ... */}
			</div>
		)
		const Component2 = props => (
			<div>
				{/* ... */}
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(0)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				{/* ... */}
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(1)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
			</div>
		)
		const Component2 = props => (
			<div>
				{/* ... */}
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(1)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div />
			</div>
		)
		const Component2 = props => (
			<div>
				<div />
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(0)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
})

// group 2 (1 of 2)
//
// a b
// b c
// c
//
// a a
// b c
// c
//
// a b
// b c
// c
//
describe("group 2 (1 of 2)", () => {
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
})

// group 2 (2 of 2)
//
// b a
// c b
//   c
//
// a a
// c b
//   c
//
// b a
// c b
//   c
//
describe("group 2 (2 of 2)", () => {
	test("", () => {
		const Component1 = props => (
			<div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
})

// group 3 (1 of 2)
//
// a -
// b a
// c b
//   c
//
// a a
// b -
// c b
//   c
//
// a a
// b b
// c -
//   c
//
// a a
// b b
// c c
//   -
//
describe("group 3 (1 of 2)", () => {
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>
					<br />
				</div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>
					<br />
				</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>
					<br />
				</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
				<div>
					<br />
				</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(1)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
})

// group 3 (2 of 2)
//
// - a
// a b
// b c
// c
//
// a a
// - b
// b c
// c
//
// a a
// b b
// - c
// c
//
// a a
// b b
// c c
// -
//
describe("group 3 (2 of 2)", () => {
	test("", () => {
		const Component1 = props => (
			<div>
				<div>
					<br />
				</div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>
					<br />
				</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>
					<br />
				</div>
				<div>C</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(2)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
	test("", () => {
		const Component1 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
				<div>
					<br />
				</div>
			</div>
		)
		const Component2 = props => (
			<div>
				<div>A</div>
				<div>B</div>
				<div>C</div>
			</div>
		)
		const rootA = renderDOM(<Component1 />)
		const rootB = renderDOM(<Component2 />)
		const mutations = syncRoots(rootA, rootB)
		expect(mutations).toBe(1)
		expect(rootA.isEqualNode(rootB)).toBe(true)
	})
})
