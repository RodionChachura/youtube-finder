export function makePortions<T>(arr: T[], portionSize: number = 10) {
  const portions: T[][] = []

  arr.forEach((item, index) => {
    if (index % portionSize === 0) {
      portions.push([])
    }

    portions[portions.length - 1].push(item)
  })

  return portions
}