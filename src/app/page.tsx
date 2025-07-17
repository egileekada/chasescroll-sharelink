'use client'
import { Flex, Text, Image } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex w="full" h="100vh" bgColor="whitesmoke" alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
      <Image src="/logo.png" objectFit={'çontain'} w="60px" h="60px" />
      <Text fontFamily="fantasy" fontSize="30px" color="primaryColor">Chasescroll Snapshot Service!!</Text>
    </Flex>
  );
}
