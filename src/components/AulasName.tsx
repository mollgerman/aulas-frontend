import React from 'react'

type Props = {}

const AulasName = (props: Props) => {
  return (
    <div className='flex  items-end relative w-[12rem]'>
        <img src="/A.png" alt="Logo" className="w-24 h-24 ml-1 rounded-full" />
        <h2 className='absolute right-14 bottom-2 font-bold pb-4 text-3xl text-indigo-900'>ulas</h2>
      </div>
  )
}

export default AulasName