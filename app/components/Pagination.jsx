import Link from "next/link"
import "@/app/styles/globals.css"

export default function Pagination({ number, pages, filter, query, page }) {
  function generatePagination(numberOfPages, currentPage) {
    const numbers = []
    for (let i = 1; i <= numberOfPages; i++) {
      numbers.push(i)
    }
  
    let previousNumbers = numbers.filter(number => number < currentPage).splice(-2)
    const nextNumbers = numbers.filter(number => number > currentPage).slice(0, (4 - previousNumbers.length))
    previousNumbers = numbers.filter(number => number < currentPage).splice((-4 + nextNumbers.length))
    const updatedNumbers = [...previousNumbers, currentPage, ...nextNumbers]
    if (!updatedNumbers.includes(1)) updatedNumbers.push(1)
    if (!updatedNumbers.includes(numberOfPages)) updatedNumbers.push(numberOfPages)
    const finalNumbers = updatedNumbers.sort((a, b) => a - b)
  
    return finalNumbers.map(number => {
      if (currentPage === number) return <p>{number}</p>
      return <Link href={`${page}?page=${number}${!filter? "" : `&filter=${filter}`}${!query? "" : `&q=${query}`}`}>{number}</Link>
    })
  }
  
  return (
    <div className="pagination">
      { number === 1? null : 
        <Link href={`${page}?page=${number - 1}${!filter? "" : `&filter=${filter}`}${!query? "" : `&q=${query}`}`}>Prev</Link> 
      }
      { generatePagination(pages, number) }
      { number === pages? null : 
        <Link href={`${page}?page=${number + 1}${!filter? "" : `&filter=${filter}`}${!query? "" : `&q=${query}`}`}>Next</Link> 
      }
    </div>
  )
}